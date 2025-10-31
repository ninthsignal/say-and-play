export function normalizeTranscript(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\bredbox\b/g, "red box")
    .split(/\s+/)
    .filter(Boolean);
}

export function levenshteinDistance(a: string, b: string) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i += 1) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= b.length; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

function joinTokens(tokens: string[]) {
  return tokens.join(" ");
}

export function phrasesMatch(
  transcript: string,
  phrases: string[],
  tolerance: number,
) {
  const transcriptTokens = normalizeTranscript(transcript);

  if (!transcriptTokens.length) {
    return false;
  }

  const transcriptJoined = joinTokens(transcriptTokens);
  const transcriptCompact = transcriptTokens.join("");

  return phrases.some((phrase) => {
    const phraseTokens = normalizeTranscript(phrase);
    if (!phraseTokens.length) {
      return false;
    }

    const phraseJoined = joinTokens(phraseTokens);
    const phraseCompact = phraseTokens.join("");

    if (transcriptJoined.includes(phraseJoined) || transcriptCompact.includes(phraseCompact)) {
      return true;
    }

    if (transcriptTokens.length >= phraseTokens.length) {
      const suffixTokens = transcriptTokens.slice(-phraseTokens.length);
      const transcriptSuffix = joinTokens(suffixTokens);
      const suffixCompact = suffixTokens.join("");

      if (transcriptSuffix.includes(phraseJoined) || suffixCompact.includes(phraseCompact)) {
        return true;
      }

      const distance = levenshteinDistance(transcriptSuffix, phraseJoined);
      if (distance <= tolerance) {
        return true;
      }

      const compactDistance = levenshteinDistance(suffixCompact, phraseCompact);
      if (compactDistance <= tolerance) {
        return true;
      }
    }

    return false;
  });
}
