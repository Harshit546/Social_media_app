export const createPostRules = {
    content: 'required|min:1|max:500'
};

export const updatePostRules = {
    content: 'required|min:1|max:500'
};

export const postMessages = {
    'content.required': 'Content is required',
    'content.min': 'Content must be at least 1 character',
    'content.max': 'Content must be at most 500 characters'
};

export const commentRules = {
    content: 'required|min:1|max:500'
};

export const commentMessages = {
    'content.required': 'Comment content is required',
    'content.min': 'Comment must be at least 1 character',
    'content.max': 'Comment must be at most 500 characters'
};