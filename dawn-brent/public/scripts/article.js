'use strict';
var app = app || {};

((module) => {
  module.Article = function (rawDataObj) {
    // REVIEW: In Lab 8, we explored a lot of new functionality going on here. Let's re-examine the concept of context. Normally, "this" inside of a constructor function refers to the newly instantiated object. However, in the function we're passing to forEach, "this" would normally refer to "undefined" in strict mode. As a result, we had to pass a second argument to forEach to make sure our "this" was still referring to our instantiated object. One of the primary purposes of lexical arrow functions, besides cleaning up syntax to use fewer lines of code, is to also preserve context. That means that when you declare a function using lexical arrows, "this" inside the function will still be the same "this" as it was outside the function. As a result, we no longer have to pass in the optional "this" argument to forEach!
    Object.keys(rawDataObj).forEach(key => this[key] = rawDataObj[key]);
  }

  module.Article.all = [];

  module.Article.prototype.authorData = function() {
    var template = Handlebars.compile($('#author-data-template').text());
    let data = {};
    return template(data);
  };

  module.Article.prototype.toHtml = function() {
    var template = Handlebars.compile($('#article-template').text());

    this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
    this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
    this.body = marked(this.body);

    return template(this);
  };

  module.Article.loadAll = articleData => {
    articleData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)));
    // articleData.map(articleObject => module.Article.all.push(new module.Article(articleObject)));
    module.Article.all = articleData.map(articleObject => new module.Article(articleObject));
    /* OLD forEach():
    articleData.forEach(articleObject => module.Article.all.push(new Article(articleObject)));
    */

  };

  module.Article.fetchAll = callback => {
    $.get('/articles')
      .then(results => {
        module.Article.loadAll(results);
        callback();
      })
  };

  module.Article.numWordsAll = () => {
    return module.Article.all.map(articleThing => articleThing.body.split(" ")).reduce((wordCount, wordList) => {
      return wordCount += wordList.length;
    }, 0)
  };

  module.Article.allAuthors = () => {
    return module.Article.all.map(art => art.author).reduce((authorList, author) => {
      if(!authorList.includes(author)){
        authorList.push(author);
      }
      return authorList;
    },[]);
  };

  module.Article.numWordsByAuthor = () => {
    return module.Article.allAuthors().map(author => {
      let authorData = {
        name: author,
        words: module.Article.all.filter(x => x.author===author).map(articleThing => articleThing.body.split(" ")).reduce((wordCount, wordList) => {
          return wordCount += wordList.length;
        }, 0)
      }
      return authorData;

    })
  };

  module.Article.truncateTable = callback => {
    $.ajax({
      url: '/articles',
      method: 'DELETE',
    })
      .then(console.log)
    // REVIEW: Check out this clean syntax for just passing 'assumed' data into a named function! The reason we can do this has to do with the way Promise.prototype.then() works. It's a little outside the scope of 301 material, but feel free to research!
      .then(callback);
  };

  module.Article.prototype.insertRecord = function(callback) {
    // REVIEW: Why can't we use an arrow function here for .insertRecord()?
    $.post('/articles', {author: this.author, authorUrl: this.authorUrl, body: this.body, category: this.category, publishedOn: this.publishedOn, title: this.title})
      .then(console.log)
      .then(callback);
  };

  module.Article.prototype.deleteRecord = function(callback) {
    $.ajax({
      url: `/articles/${this.article_id}`,
      method: 'DELETE'
    })
      .then(console.log)
      .then(callback);
  };

  module.Article.prototype.updateRecord = function(callback) {
    $.ajax({
      url: `/articles/${this.article_id}`,
      method: 'PUT',
      data: {
        author: this.author,
        authorUrl: this.authorUrl,
        body: this.body,
        category: this.category,
        publishedOn: this.publishedOn,
        title: this.title,
        author_id: this.author_id
      }
    })
      .then(console.log)
      .then(callback);
  };
})(app);
