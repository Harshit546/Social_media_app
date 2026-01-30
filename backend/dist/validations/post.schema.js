"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postMessages = exports.updatePostRules = exports.createPostRules = void 0;
exports.createPostRules = {
    content: 'sometimes|min:1|max:500'
};
exports.updatePostRules = {
    content: 'sometimes|min:1|max:500'
};
exports.postMessages = {
    'content.required': 'Content is required',
    'content.min': 'Content must be at least 1 character',
    'content.max': 'Content must be at most 500 characters'
};
