const commitTypeList = {
  feat: {
    description: 'A new feature',
    emoji: '🌟',
  },
  refactor: {
    description: 'A code change that neither fixes a bug or adds a feature',
    emoji: '💡',
  },
  fix: {
    description: 'A bug fix',
    emoji: '🐛',
  },
  review: {
    description: 'Updating code due to code review changes',
    emoji: '👌',
  },
  chore: {
    description: 'Build process or auxiliary tool changes',
    emoji: '🔧',
  },
  perf: {
    description: 'A code change that improves performance',
    emoji: '⚡️',
  },
  test: {
    description: 'Adding missing tests',
    emoji: '👷',
  },
  docs: {
    description: 'Documentation only changes',
    emoji: '📚',
  },
  style: {
    description: 'Markup, white-space, formatting, missing semi-colons...',
    emoji: '🎨',
  },
  temp: {
    description: 'Work in progress',
    emoji: '🚧',
  },
  ci: {
    description: 'CI related changes',
    emoji: '🎡',
  },
  release: {
    description: 'Releasing / Version tags',
    emoji: '🔖',
  },
  lint: {
    description: 'Change linter rules',
    emoji: '🚨',
  },
  merge: {
    description: 'Merging branches',
    emoji: '🔀',
  },
  mv: {
    description: 'Moving or renaming files',
    emoji: '🚚',
  },
};

const getTypes = () => {
  const result = {};
  for (const type in commitTypeList) {
    if (commitTypeList.hasOwnProperty(type)) {
      const element = commitTypeList[type];
      result[type] = {
        ...element,
        value: type,
      };
    }
  }

  return result;
};

module.exports = {
  disableEmoji: false,
  list: Object.keys(commitTypeList),
  maxMessageLength: 80,
  minMessageLength: 3,
  questions: ['type', 'scope', 'subject', 'body'],
  scopes: [
    '',
    'FE/assets',
    'FE/components',
    'FE/charts',
    'FE/modals',
    'FE/router',
    'FE/store',
    'FE/tests',
    'FE/views',
    'FE/app',
    'BE/events',
    'BE/forms',
    'BE/general',
    'BE/migrations',
    'BE/shared',
    'BE/teams',
    'BE/types',
    'BE/uploads',
    'BE/users',
    'BE/app',
    'BE/test',
    'configuration',
    'env',
    'readme',
    'release-tags',
    'devops-tools',
    'sql',
    'husky',
    'docker'
  ],
  types: getTypes(),
};
