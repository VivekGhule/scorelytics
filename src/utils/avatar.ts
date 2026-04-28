import { UserProfile } from '../types';

const MALE_AVATAR_STYLE = 'thumbs';
const FEMALE_AVATAR_STYLE = 'bottts-neutral';

export type AvatarUser = Pick<UserProfile, 'name' | 'email' | 'gender'>;

export const getProfileAvatarUrl = (user: AvatarUser | null | undefined): string => {
  const seedSource = user?.email || user?.name || 'scorelytics-user';
  const seed = encodeURIComponent(seedSource.trim() || 'scorelytics-user');
  const style = user?.gender === 'female' ? FEMALE_AVATAR_STYLE : MALE_AVATAR_STYLE;
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
};
