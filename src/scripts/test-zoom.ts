
import { createZoomMeeting } from '../lib/zoom';
import * as dotenv from 'dotenv';
dotenv.config();

async function testZoom() {
  console.log('Testing Zoom API Integration...');
  try {
    const meeting = await createZoomMeeting({
      topic: 'Test Consultation Meeting',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      duration: 30,
    });
    console.log('✅ Success! Zoom meeting created:');
    console.log('Meeting ID:', meeting.id);
    console.log('Join URL:', meeting.join_url);
    if (meeting.password) console.log('Password:', meeting.password);
  } catch (error) {
    console.error('❌ Failed to create Zoom meeting:', error);
  }
}

testZoom();
