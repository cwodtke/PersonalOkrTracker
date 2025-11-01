import { useState, useEffect } from 'react';
import './OKRQualityChecker.css';

export default function OKRQualityChecker({ objective, keyResults }) {
  const [feedback, setFeedback] = useState([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const newFeedback = [];
    let totalScore = 0;

    // Check 1: Objective is inspirational (not too short, not a task)
    if (objective && objective.trim()) {
      const objLower = objective.toLowerCase();
      const taskWords = ['create', 'build', 'make', 'write', 'implement', 'add', 'fix', 'update'];
      const hasTaskWord = taskWords.some(word => objLower.startsWith(word));

      if (objective.length < 15) {
        newFeedback.push({
          type: 'warning',
          title: 'Objective too short',
          message: 'A good Objective should be inspirational and descriptive. Try to make it more compelling.',
          example: 'Instead of "Get users" → "Become the go-to platform for daily goal tracking"'
        });
      } else if (hasTaskWord) {
        newFeedback.push({
          type: 'warning',
          title: 'Objective sounds like a task',
          message: 'Objectives should describe outcomes, not actions. Focus on the "why" not the "how".',
          example: 'Instead of "Build new feature" → "Delight users with effortless goal tracking"'
        });
      } else {
        totalScore += 25;
        newFeedback.push({
          type: 'success',
          title: 'Good objective!',
          message: 'Your objective is inspirational and outcome-focused.'
        });
      }
    }

    // Check 2: Number of Key Results (3-5 is ideal per Radical Focus)
    const numKRs = keyResults?.filter(kr => kr.description?.trim()).length || 0;

    if (numKRs === 0) {
      newFeedback.push({
        type: 'error',
        title: 'No Key Results',
        message: 'You need 3-5 Key Results to measure progress toward your Objective.',
        example: 'Each Key Result should answer: "How will I know I\'ve achieved this objective?"'
      });
    } else if (numKRs < 3) {
      newFeedback.push({
        type: 'warning',
        title: 'Too few Key Results',
        message: `You have ${numKRs} Key Result${numKRs === 1 ? '' : 's'}. Radical Focus recommends 3-5 to properly measure success.`,
        example: 'Add more measurable outcomes that define success for this objective.'
      });
      totalScore += 10;
    } else if (numKRs >= 3 && numKRs <= 5) {
      totalScore += 25;
      newFeedback.push({
        type: 'success',
        title: 'Perfect number of Key Results!',
        message: `${numKRs} Key Results is the sweet spot for tracking progress.`
      });
    } else {
      newFeedback.push({
        type: 'warning',
        title: 'Too many Key Results',
        message: `You have ${numKRs} Key Results. This can dilute focus. Try to consolidate to 3-5.`,
        example: 'Ask yourself: which metrics truly define success? Combine or remove less critical ones.'
      });
      totalScore += 10;
    }

    // Check 3: Key Results are measurable
    if (keyResults && keyResults.length > 0) {
      const measurableKRs = keyResults.filter(kr => {
        const desc = kr.description?.toLowerCase() || '';
        const hasNumber = /\d/.test(desc);
        const hasMetric = /(increase|decrease|achieve|reach|maintain|reduce|grow|improve|from|to|by|%)/.test(desc);
        const isMeasurable = kr.type === 'numeric' || hasNumber || hasMetric;
        return kr.description?.trim() && isMeasurable;
      });

      const measurableRatio = measurableKRs.length / numKRs;

      if (measurableRatio >= 0.8) {
        totalScore += 25;
        newFeedback.push({
          type: 'success',
          title: 'Key Results are measurable',
          message: 'Your Key Results have clear metrics for tracking progress.'
        });
      } else if (measurableRatio >= 0.5) {
        totalScore += 15;
        newFeedback.push({
          type: 'warning',
          title: 'Some Key Results lack metrics',
          message: 'Make sure each Key Result has a clear number or metric.',
          example: 'Instead of "Improve engagement" → "Increase daily active users from 100 to 150"'
        });
      } else {
        newFeedback.push({
          type: 'warning',
          title: 'Key Results need metrics',
          message: 'Key Results should be specific and measurable. Add numbers, percentages, or clear targets.',
          example: 'Instead of "Get more users" → "Grow user base by 25% (from 400 to 500)"'
        });
      }
    }

    // Check 4: Key Results are outcomes, not tasks
    if (keyResults && keyResults.length > 0) {
      const taskWords = ['create', 'build', 'make', 'write', 'implement', 'add', 'launch', 'ship', 'deploy', 'design', 'develop'];
      const taskLikeKRs = keyResults.filter(kr => {
        const desc = kr.description?.toLowerCase() || '';
        return taskWords.some(word => desc.includes(word));
      });

      if (taskLikeKRs.length === 0) {
        totalScore += 25;
        newFeedback.push({
          type: 'success',
          title: 'Key Results are outcome-focused',
          message: 'Your Key Results describe results, not tasks. Great work!'
        });
      } else {
        newFeedback.push({
          type: 'warning',
          title: 'Some Key Results sound like tasks',
          message: `${taskLikeKRs.length} Key Result${taskLikeKRs.length === 1 ? '' : 's'} may be describing activities rather than outcomes.`,
          example: 'Instead of "Launch new feature" → "Increase user retention to 85%"'
        });
        totalScore += 10;
      }
    }

    setFeedback(newFeedback);
    setScore(totalScore);
  }, [objective, keyResults]);

  const getScoreColor = () => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'needs-work';
  };

  const getScoreLabel = () => {
    if (score >= 80) return 'Excellent OKR!';
    if (score >= 60) return 'Good OKR';
    if (score >= 40) return 'Needs improvement';
    return 'Needs significant improvement';
  };

  if (feedback.length === 0) return null;

  return (
    <div className="okr-quality-checker">
      <div className="quality-header">
        <h4>📊 OKR Quality Check</h4>
        <div className={`quality-score ${getScoreColor()}`}>
          <span className="score-value">{score}/100</span>
          <span className="score-label">{getScoreLabel()}</span>
        </div>
      </div>

      <div className="quality-feedback">
        {feedback.map((item, index) => (
          <div key={index} className={`feedback-item ${item.type}`}>
            <div className="feedback-header">
              <span className="feedback-icon">
                {item.type === 'success' && '✓'}
                {item.type === 'warning' && '⚠'}
                {item.type === 'error' && '✕'}
              </span>
              <strong>{item.title}</strong>
            </div>
            <p className="feedback-message">{item.message}</p>
            {item.example && (
              <p className="feedback-example">
                <em>{item.example}</em>
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="radical-focus-tip">
        <strong>💡 Radical Focus Tip:</strong> Focus on ONE critical objective per quarter.
        Your OKR should answer: "What's the ONE thing that will make everything else easier or unnecessary?"
      </div>
    </div>
  );
}
