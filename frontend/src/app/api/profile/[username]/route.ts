import { NextResponse } from 'next/server';
import { connectDB, User, getUserAchievements, handleError } from '@flowstate/backend';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    await connectDB();
    const { username } = await params;

    const user = await User.findOne({ username: username.toLowerCase() })
      .select('-password -email -updatedAt -__v')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const achievements = await getUserAchievements(user._id.toString());
    const unlockedAchievements = achievements.filter((a) => a.unlocked);

    return NextResponse.json({
      user,
      achievements: unlockedAchievements,
    });
  } catch (error: any) {
    const { message, statusCode } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
