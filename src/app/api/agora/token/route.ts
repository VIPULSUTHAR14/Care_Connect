import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { channelName, uid } = await request.json();

    if (!channelName || uid === undefined) {
      return NextResponse.json({ error: 'channelName and uid are required' }, { status: 400 });
    }

    const appId = "5abea553b6aa420696aa6fae2025e41a";
    const appCertificate ="51d800c09e944878b50d57146592f289";

    if (!appId || !appCertificate) {
      console.error('Agora credentials are not configured.');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600; // Token expires in 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Fix: buildTokenWithUid expects 7 arguments (appId, appCertificate, channelName, uid, role, privilegeExpiredTs, joinChannelPrivilegeExpiredTs)
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      privilegeExpiredTs,
      privilegeExpiredTs // Use the same expiration for both privileges
    );
    
    return NextResponse.json({ token });

  } catch (error: unknown) {
    console.error("Error generating Agora token:", error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}