import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test environment variables
    const hasDbUrl = !!process.env.DATABASE_URL;
    const hasDirectUrl = !!process.env.DIRECT_URL;
    
    // Test database connection
    const userCount = await prisma.user.count();
    const teamCount = await prisma.team.count();
    const trainingCount = await prisma.training.count();
    
    // Get first user for testing
    const firstUser = await prisma.user.findFirst();
    const teamsWithUser = firstUser ? await prisma.team.count({
      where: { coachId: firstUser.id }
    }) : 0;
    
    return NextResponse.json({
      success: true,
      environment: {
        hasDbUrl,
        hasDirectUrl,
        nodeEnv: process.env.NODE_ENV,
      },
      database: {
        userCount,
        teamCount,
        trainingCount,
        connected: true,
        firstUserId: firstUser?.id,
        teamsOwnedByFirstUser: teamsWithUser,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}