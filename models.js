'use strict';

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const commentSchema = mongoose.Schema({
  content: String
});

const authorSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  userName: { type: String, unique: true }
});

const blogPostSchema = mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId },
  title: {type: String, required: true},
  content: {type: String},
  created: {type: Date, default: Date.now},
  comment: [ commentSchema ]
});

blogPostSchema.pre("find", function(next) {
  this.populate("author");
  next();
});

blogPostSchema.pre("findOne", function(next) {
  this.populate("author");
  next();
});

blogPostSchema.virtual("authorName").get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogPostSchema.methods.serialize = function() {
  return {
    id: this._id,
    author: this.authorName,
    content: this.content,
    title: this.title,
    created: this.created,
    comments: this.comments
  };
};

let Author = mongoose.model("Author", authorSchema)
const BlogPost = mongoose.model("BlogPost", blogPostSchema);

module.exports = {Author, BlogPost};
