
interface ZoomTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface ZoomMeetingResponse {
  id: number;
  join_url: string;
  password?: string;
  topic: string;
  start_time: string;
  duration: number;
}

export async function getZoomAccessToken(): Promise<string> {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    throw new Error('Missing Zoom account ID, client ID, or client secret');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Zoom auth error:', errorData);
    throw new Error(`Failed to get Zoom access token: ${response.statusText}`);
  }

  const data = (await response.json()) as ZoomTokenResponse;
  return data.access_token;
}

export async function createZoomMeeting({
  topic,
  startTime,
  duration,
}: {
  topic: string;
  startTime: string;
  duration: number;
}): Promise<ZoomMeetingResponse> {
  const accessToken = await getZoomAccessToken();

  const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic,
      type: 2, // Scheduled meeting
      start_time: startTime,
      duration,
      timezone: 'UTC',
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Zoom meeting creation error:', errorData);
    throw new Error(`Failed to create Zoom meeting: ${response.statusText}`);
  }

  return response.json() as Promise<ZoomMeetingResponse>;
}
