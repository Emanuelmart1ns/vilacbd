import { NextResponse } from "next/server";

export async function GET() {
  const envVars = {
    hasServiceAccountKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    hasProjectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
    hasClientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    hasPrivateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    serviceAccountKeyPrefix: process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.substring(0, 50) || 'not set',
    nodeEnv: process.env.NODE_ENV,
  };

  return NextResponse.json(envVars);
}
