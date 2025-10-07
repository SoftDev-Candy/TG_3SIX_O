// Track user votes in localStorage for mock mode
const VOTE_TRACKER_KEY = 'user_votes';

export interface UserVote {
  reportId: string;
  voteType: 'upvote' | 'downvote';
  votedAt: string;
}

export function getUserVotes(): UserVote[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const votes = localStorage.getItem(VOTE_TRACKER_KEY);
    return votes ? JSON.parse(votes) : [];
  } catch {
    return [];
  }
}

export function hasUserVoted(reportId: string): 'upvote' | 'downvote' | null {
  const votes = getUserVotes();
  const vote = votes.find(v => v.reportId === reportId);
  return vote ? vote.voteType : null;
}

export function recordVote(reportId: string, voteType: 'upvote' | 'downvote'): void {
  if (typeof window === 'undefined') return;
  
  const votes = getUserVotes();
  
  // Check if user already voted on this report
  const existingVoteIndex = votes.findIndex(v => v.reportId === reportId);
  
  if (existingVoteIndex !== -1) {
    const existingVote = votes[existingVoteIndex];
    
    if (existingVote.voteType === voteType) {
      // Clicking same vote - remove it (toggle off)
      votes.splice(existingVoteIndex, 1);
      localStorage.setItem(VOTE_TRACKER_KEY, JSON.stringify(votes));
      console.log(`🎭 Vote removed: ${voteType} on ${reportId}`);
      return;
    } else {
      // Changing vote type - update it
      votes[existingVoteIndex] = {
        reportId,
        voteType,
        votedAt: new Date().toISOString(),
      };
      localStorage.setItem(VOTE_TRACKER_KEY, JSON.stringify(votes));
      console.log(`🎭 Vote changed: ${existingVote.voteType} → ${voteType} on ${reportId}`);
      return;
    }
  }
  
  // Add new vote
  votes.push({
    reportId,
    voteType,
    votedAt: new Date().toISOString(),
  });
  
  localStorage.setItem(VOTE_TRACKER_KEY, JSON.stringify(votes));
  console.log(`🎭 Vote recorded: ${voteType} on ${reportId}`);
}

export function removeVote(reportId: string): void {
  if (typeof window === 'undefined') return;
  
  const votes = getUserVotes();
  const filteredVotes = votes.filter(v => v.reportId !== reportId);
  
  localStorage.setItem(VOTE_TRACKER_KEY, JSON.stringify(filteredVotes));
  console.log(`🎭 Vote removed for ${reportId}`);
}

export function clearVotes(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(VOTE_TRACKER_KEY);
}
