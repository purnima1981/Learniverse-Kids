import chapterQuestions from '../data/chapterQuestions';

// Expose a function to check questions in the global scope
(window as any).checkQuestions = () => {
  // Print all chapter keys
  console.log('Chapter keys:', Object.keys(chapterQuestions));

  // Count questions per chapter
  console.log('\nNumber of questions per chapter:');
  Object.keys(chapterQuestions).forEach(key => {
    console.log(`${key}: ${chapterQuestions[key]?.length || 0} questions`);
  });

  // Check question types in a specific chapter
  const questionTypes: Record<string, number> = {};
  if (chapterQuestions['8001-4']) {
    chapterQuestions['8001-4'].forEach(q => {
      if (q.type) {
        questionTypes[q.type] = (questionTypes[q.type] || 0) + 1;
      }
    });
  }
  console.log('\nQuestion types in chapter 8001-4:', questionTypes);

  // Print all themes
  const themes: string[] = [];
  if (chapterQuestions['8001-4']) {
    chapterQuestions['8001-4'].forEach(q => {
      if (q.theme && !themes.includes(q.theme)) {
        themes.push(q.theme);
      }
    });
  }
  console.log('\nThemes used in chapter 8001-4:', themes);

  // Count questions by difficulty
  const difficulties: Record<string, number> = {};
  if (chapterQuestions['8001-4']) {
    chapterQuestions['8001-4'].forEach(q => {
      if (q.difficulty) {
        difficulties[q.difficulty] = (difficulties[q.difficulty] || 0) + 1;
      }
    });
  }
  console.log('\nDifficulty levels in chapter 8001-4:', difficulties);

  return {
    totalChapters: Object.keys(chapterQuestions).length,
    chapter8001_4: {
      totalQuestions: chapterQuestions['8001-4']?.length || 0,
      questionTypes,
      themes,
      difficulties
    }
  };
};