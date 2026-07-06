export type SummaryMode =
  | "short"
  | "detailed"
  | "bullets"
  | "revision"
  | "flashcards"
  | "questions";

export type Analytics = {
  wordCount: number;
  charCount: number;
  readingTimeMin: number;
  keyTopics: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
};

export type AnalysisResult = {
  analytics: Analytics;
  output: string;
};

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"
]);

const DEFINITION_MARKERS = [
  " is defined as ",
  " refers to ",
  " means ",
  " is a type of ",
  " known as ",
  " called ",
  " represents ",
  " stands for "
];

function getSentences(text: string): string[] {
  return text.match(/[^.!?\n]+[.!?\n]+/g)?.map(s => s.trim().replace(/\s+/g, ' ')).filter(s => s.length > 5) || [];
}

function getWords(text: string): string[] {
  return text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
}

export function analyzeNotes(text: string, mode: SummaryMode): AnalysisResult {
  const sentences = getSentences(text);
  const rawWords = text.match(/\b\w+\b/g) || [];
  const words = getWords(text);
  
  const wordCount = rawWords.length;
  const charCount = text.length;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  // Compute Word Frequency (TF)
  const wordFreq: Record<string, number> = {};
  words.forEach(word => {
    if (!STOP_WORDS.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  const sortedTerms = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);
  
  const keyTopics = sortedTerms.slice(0, 8);
  
  // Calculate difficulty based on word length and sentence length
  const avgWordLength = words.length ? words.reduce((a, b) => a + b.length, 0) / words.length : 0;
  const avgSentenceLength = sentences.length ? wordCount / sentences.length : 0;
  
  let difficulty: "Beginner" | "Intermediate" | "Advanced" = "Beginner";
  if (avgWordLength > 6.5 || avgSentenceLength > 20) difficulty = "Advanced";
  else if (avgWordLength > 5.5 || avgSentenceLength > 15) difficulty = "Intermediate";

  const analytics: Analytics = {
    wordCount,
    charCount,
    readingTimeMin,
    keyTopics,
    difficulty
  };

  if (sentences.length <= 3) {
    return { analytics, output: text }; // Too short to process meaningfully
  }

  // Score sentences
  const sentenceScores = sentences.map((sentence, index) => {
    const sWords = getWords(sentence);
    let score = 0;
    
    // TF scoring
    sWords.forEach(w => {
      if (wordFreq[w]) score += wordFreq[w];
    });
    
    // Boost for definition markers
    DEFINITION_MARKERS.forEach(marker => {
      if (sentence.toLowerCase().includes(marker)) score *= 1.5;
    });

    // Boost early sentences slightly
    if (index < sentences.length * 0.1) score *= 1.2;
    
    // Normalize
    score = sWords.length > 0 ? score / Math.sqrt(sWords.length) : 0;
    
    return { sentence, score, index };
  });

  const rankedSentences = [...sentenceScores].sort((a, b) => b.score - a.score);

  let output = "";

  switch (mode) {
    case "short": {
      const topCount = Math.max(3, Math.ceil(sentences.length * 0.1));
      const top = rankedSentences.slice(0, topCount).sort((a, b) => a.index - b.index);
      output = "### Short Summary\n\n" + top.map(s => s.sentence).join(" ");
      break;
    }
    
    case "detailed": {
      const topCount = Math.max(5, Math.ceil(sentences.length * 0.3));
      const top = rankedSentences.slice(0, topCount).sort((a, b) => a.index - b.index);
      
      // Group into paragraphs
      let paragraphs = [];
      let currentPara = [];
      
      for (let i = 0; i < top.length; i++) {
        currentPara.push(top[i].sentence);
        if (currentPara.length >= 4 || i === top.length - 1) {
          paragraphs.push(currentPara.join(" "));
          currentPara = [];
        }
      }
      
      output = "### Detailed Summary\n\n" + paragraphs.join("\n\n");
      break;
    }
    
    case "bullets": {
      const topCount = Math.max(4, Math.ceil(sentences.length * 0.2));
      const top = rankedSentences.slice(0, topCount).sort((a, b) => a.index - b.index);
      output = "### Bullet Notes\n\n" + top.map(s => `- ${s.sentence}`).join("\n");
      break;
    }
    
    case "revision": {
      // Find definitions
      const definitions = sentences.filter(s => 
        DEFINITION_MARKERS.some(marker => s.toLowerCase().includes(marker))
      );
      
      const topCount = Math.max(3, Math.ceil(sentences.length * 0.15));
      const keyPoints = rankedSentences.slice(0, topCount).map(s => s.sentence);
      
      let res = "### Exam Revision Mode\n\n";
      
      if (definitions.length > 0) {
        res += "**Definitions & Core Concepts:**\n";
        definitions.slice(0, 10).forEach(d => {
          res += `- ${d}\n`;
        });
        res += "\n";
      }
      
      res += "**Key Points to Remember:**\n";
      keyPoints.forEach(kp => {
        res += `- ${kp}\n`;
      });
      
      res += `\n**Important Topics:** ${keyTopics.join(", ")}`;
      output = res;
      break;
    }
    
    case "flashcards": {
      const flashcards: {q: string, a: string}[] = [];
      
      // Attempt to extract definition flashcards
      sentences.forEach(s => {
        const lower = s.toLowerCase();
        for (const marker of DEFINITION_MARKERS) {
          if (lower.includes(marker)) {
            const parts = s.split(new RegExp(marker, 'i'));
            if (parts.length === 2 && parts[0].length < 50 && parts[1].length > 10) {
              const term = parts[0].trim().replace(/^(the|a|an)\s+/i, '');
              const capitalizedTerm = term.charAt(0).toUpperCase() + term.slice(1);
              flashcards.push({
                q: `What is ${capitalizedTerm}?`,
                a: s
              });
              break;
            }
          }
        }
      });
      
      // Fallback or fill out with top sentences
      if (flashcards.length < 5) {
        const needed = 5 - flashcards.length;
        const candidates = rankedSentences.slice(0, needed + flashcards.length).map(s => s.sentence);
        candidates.forEach(c => {
          // ensure not already added
          if (!flashcards.some(f => f.a === c)) {
            const importantWord = keyTopics.find(t => c.toLowerCase().includes(t)) || keyTopics[0];
            flashcards.push({
              q: `Explain the significance of '${importantWord}' in this context.`,
              a: c
            });
          }
        });
      }
      
      output = "### Flashcards\n\n" + flashcards.slice(0, 15).map((f, i) => `**Q${i+1}:** ${f.q}\n**A${i+1}:** ${f.a}`).join("\n\n---\n\n");
      break;
    }
    
    case "questions": {
      const questions: string[] = [];
      
      const topSentences = rankedSentences.slice(0, 8).map(s => s.sentence);
      
      topSentences.forEach((s, i) => {
        const matchTopic = keyTopics.find(t => s.toLowerCase().includes(t));
        if (matchTopic) {
          if (i % 3 === 0) questions.push(`Explain the concept of ${matchTopic} and its implications.`);
          else if (i % 3 === 1) questions.push(`What are the key characteristics of ${matchTopic}?`);
          else questions.push(`Discuss the importance of ${matchTopic} as described in the text.`);
        }
      });
      
      // Add a general essay question
      if (keyTopics.length >= 2) {
        questions.push(`Compare and contrast ${keyTopics[0]} and ${keyTopics[1]}.`);
      }
      
      output = "### Important Questions\n\n" + Array.from(new Set(questions)).map((q, i) => `${i+1}. ${q}`).join("\n\n");
      break;
    }
  }

  return { analytics, output };
}
