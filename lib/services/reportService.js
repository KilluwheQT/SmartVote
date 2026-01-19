import { 
  collection, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../firebase';
import { decryptVote } from '../encryption';

export const generateElectionReport = async (electionId) => {
  try {
    // Get election data
    const electionDoc = await getDocs(query(
      collection(db, 'elections'),
      where('__name__', '==', electionId)
    ));
    
    // Get all votes
    const votesQuery = query(
      collection(db, 'votes'),
      where('electionId', '==', electionId)
    );
    const votesSnapshot = await getDocs(votesQuery);
    
    // Get all candidates
    const candidatesQuery = query(
      collection(db, 'candidates'),
      where('electionId', '==', electionId)
    );
    const candidatesSnapshot = await getDocs(candidatesQuery);
    
    // Get all voters
    const votersQuery = query(
      collection(db, 'voters'),
      where('electionId', '==', electionId)
    );
    const votersSnapshot = await getDocs(votersQuery);

    // Process results
    const results = {};
    const candidates = {};
    
    candidatesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      candidates[doc.id] = data;
      if (!results[data.position]) {
        results[data.position] = {};
      }
      results[data.position][doc.id] = {
        name: data.name,
        votes: 0
      };
    });

    // Count votes (decrypt and tally)
    votesSnapshot.docs.forEach(doc => {
      const vote = doc.data();
      try {
        const selections = decryptVote(vote.encryptedSelections);
        Object.entries(selections).forEach(([position, candidateId]) => {
          if (results[position] && results[position][candidateId]) {
            results[position][candidateId].votes++;
          }
        });
      } catch (e) {
        console.error('Error decrypting vote:', e);
      }
    });

    // Determine winners
    const winners = {};
    Object.entries(results).forEach(([position, candidates]) => {
      let maxVotes = 0;
      let winner = null;
      Object.entries(candidates).forEach(([candidateId, data]) => {
        if (data.votes > maxVotes) {
          maxVotes = data.votes;
          winner = { candidateId, ...data };
        }
      });
      winners[position] = winner;
    });

    return {
      success: true,
      data: {
        totalVoters: votersSnapshot.size,
        totalVotes: votesSnapshot.size,
        turnoutPercentage: votersSnapshot.size > 0 
          ? ((votesSnapshot.size / votersSnapshot.size) * 100).toFixed(2) 
          : 0,
        results,
        winners,
        generatedAt: new Date()
      }
    };
  } catch (error) {
    console.error('Generate report error:', error);
    return { success: false, error: error.message };
  }
};

export const getParticipationByGradeLevel = async (electionId) => {
  try {
    const votersQuery = query(
      collection(db, 'voters'),
      where('electionId', '==', electionId)
    );
    const votersSnapshot = await getDocs(votersQuery);

    const participation = {};
    votersSnapshot.docs.forEach(doc => {
      const voter = doc.data();
      const level = voter.gradeLevel || 'Unknown';
      
      if (!participation[level]) {
        participation[level] = { total: 0, voted: 0 };
      }
      participation[level].total++;
      if (voter.status === 'voted') {
        participation[level].voted++;
      }
    });

    return participation;
  } catch (error) {
    console.error('Get participation error:', error);
    return {};
  }
};

export const getParticipationByDepartment = async (electionId) => {
  try {
    const votersQuery = query(
      collection(db, 'voters'),
      where('electionId', '==', electionId)
    );
    const votersSnapshot = await getDocs(votersQuery);

    const participation = {};
    votersSnapshot.docs.forEach(doc => {
      const voter = doc.data();
      const dept = voter.department || 'Unknown';
      
      if (!participation[dept]) {
        participation[dept] = { total: 0, voted: 0 };
      }
      participation[dept].total++;
      if (voter.status === 'voted') {
        participation[dept].voted++;
      }
    });

    return participation;
  } catch (error) {
    console.error('Get participation error:', error);
    return {};
  }
};

export const getParticipationBySection = async (electionId) => {
  try {
    const votersQuery = query(
      collection(db, 'voters'),
      where('electionId', '==', electionId)
    );
    const votersSnapshot = await getDocs(votersQuery);

    const participation = {};
    votersSnapshot.docs.forEach(doc => {
      const voter = doc.data();
      const section = voter.section || 'Unknown';
      
      if (!participation[section]) {
        participation[section] = { total: 0, voted: 0 };
      }
      participation[section].total++;
      if (voter.status === 'voted') {
        participation[section].voted++;
      }
    });

    return participation;
  } catch (error) {
    console.error('Get participation error:', error);
    return {};
  }
};

export const getHistoricalComparison = async (electionIds) => {
  try {
    const comparisons = [];
    
    for (const electionId of electionIds) {
      const report = await generateElectionReport(electionId);
      if (report.success) {
        comparisons.push({
          electionId,
          ...report.data
        });
      }
    }

    return comparisons;
  } catch (error) {
    console.error('Get historical comparison error:', error);
    return [];
  }
};

export const exportToJSON = (data) => {
  return JSON.stringify(data, null, 2);
};

export const prepareExcelData = (report) => {
  const sheets = {
    summary: [
      ['Election Report Summary'],
      ['Total Voters', report.totalVoters],
      ['Total Votes Cast', report.totalVotes],
      ['Turnout Percentage', `${report.turnoutPercentage}%`],
      ['Generated At', report.generatedAt?.toISOString()]
    ],
    results: [['Position', 'Candidate', 'Votes']],
    winners: [['Position', 'Winner', 'Votes']]
  };

  // Add results
  Object.entries(report.results || {}).forEach(([position, candidates]) => {
    Object.entries(candidates).forEach(([candidateId, data]) => {
      sheets.results.push([position, data.name, data.votes]);
    });
  });

  // Add winners
  Object.entries(report.winners || {}).forEach(([position, winner]) => {
    if (winner) {
      sheets.winners.push([position, winner.name, winner.votes]);
    }
  });

  return sheets;
};
