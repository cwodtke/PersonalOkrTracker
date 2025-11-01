import nodemailer from 'nodemailer';
import db from './database.js';

// For demo purposes, we'll use console logging instead of actual email
// In production, configure with real SMTP credentials

const transporter = nodemailer.createTransport({
  // Mock transport for demo - logs to console
  streamTransport: true,
  newline: 'unix',
  buffer: true
});

export async function sendDailyEmail(userId) {
  try {
    const user = db.query.getUserById(userId);

    if (!user) {
      console.error('User not found:', userId);
      return;
    }

    // Get current quarter
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
    const currentYear = now.getFullYear();

    // Get active objectives for current quarter
    const objectives = db.query.getCurrentObjectives(userId, currentQuarter, currentYear);

    // Get key results for each objective
    objectives.forEach(obj => {
      obj.keyResults = db.query.getKeyResultsByObjective(obj.id);
    });

    // Create magic link
    const { v4: uuidv4 } = await import('uuid');
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    db.query.createMagicLink({
      id: uuidv4(),
      user_id: userId,
      token,
      expires_at: expiresAt.toISOString()
    });

    const magicLink = `http://localhost:5173/auth/verify/${token}`;

    // Build email HTML
    const emailHtml = buildEmailHtml(objectives, currentQuarter, currentYear, magicLink, now);

    // For demo, log to console
    console.log('\n=================================');
    console.log('DAILY EMAIL TO:', user.email);
    console.log('=================================');
    console.log(emailHtml);
    console.log('=================================\n');

    // In production, uncomment this:
    /*
    transporter.sendMail({
      from: '"OKR Planner" <noreply@okrplanner.com>',
      to: user.email,
      subject: `Good morning! Here are your goals for Q${currentQuarter} ${currentYear}`,
      html: emailHtml
    });
    */

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

export function testEmail(userId) {
  return sendDailyEmail(userId);
}

function buildEmailHtml(objectives, quarter, year, magicLink, date) {
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let objectivesHtml = '';

  if (objectives.length === 0) {
    objectivesHtml = '<p style="color: #666;">No OKRs set for this quarter. Click below to create some!</p>';
  } else {
    objectives.forEach(obj => {
      objectivesHtml += `
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 10px 0; color: #2c3e50;">${obj.title}</h3>
      `;

      obj.keyResults.forEach(kr => {
        let progressText = '';
        if (kr.type === 'numeric') {
          const progress = Math.round(((kr.current_value - kr.start_value) / (kr.target_value - kr.start_value)) * 100);
          progressText = ` <span style="color: #27ae60;">(Progress: ${progress}%)</span>`;
        }

        objectivesHtml += `
          <div style="margin-left: 20px; margin-bottom: 5px;">
            • ${kr.description}${progressText}
          </div>
        `;
      });

      objectivesHtml += '</div>';
    });
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Good morning!</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px;">Here are your goals for Q${quarter} ${year}</p>
      </div>

      <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="color: #666; margin-top: 0;">${dateStr}</p>

        <h2 style="color: #2c3e50; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Your Objectives:</h2>

        ${objectivesHtml}

        <div style="text-align: center; margin: 40px 0 20px 0;">
          <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
            What are you going to do today? →
          </a>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #999; font-size: 12px;">
          <p>This link expires in 24 hours</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
