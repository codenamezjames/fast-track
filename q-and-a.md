## Questions about your Calorie Tracker:

### Core Features:
1. **User Authentication**: Do you want users to sign up/login, or should it work offline/locally?
It should require a login to use the app. and once logged in it should work offline. I only need "local auth" for now. 

2. **Calorie Tracking**: 
   - Should users manually enter calories, or do you want food database integration?
   Manual. I want to round really strongly. Like 50-100 calories at a time.
   - Do you want barcode scanning capability?
   No
   - Should it track macros (protein, carbs, fats) or just calories?
   lets have a similar interface for macros as well. maybe just a percentage of the meal. My vision is 33.33% for each. and you can adjust before saving.  
3. **Intermittent Fasting**:
   - Which IF methods do you want to support (16:8, 18:6, 24-hour, custom)?
   - Should it have preset fasting schedules or fully customizable?
I want the user to be able to select it. So it should have a flexable way to express on and off times that we can tie timers and alarms to. We can have suggested setups but it should support a 24-hour schedule with additional option to add an override schedule for example if i want to do a whole day of fasting every so often i should be able to add that as a one off.
   - Do you want fasting timer/notifications?
yes, they should be able to be an actual android/apple notification.

### User Experience:
4. **Platform**: Mobile-first, desktop-first, or both?
Mobile-first, it will be used on both but like 99% on mobile
5. **Data Visualization**: Do you want charts/graphs for calorie trends, weight tracking, fasting streaks?
Yes please.
6. **Goals**: Should users be able to set daily calorie goals, weight goals, fasting goals?
Naa
7. **History**: How much historical data should be accessible (last week, month, year)?
all of it, but i want to be able to filter it by time

### Technical Preferences:
8. **Deployment**: Where do you plan to deploy this (web app, mobile app, both)?
mobile app and web
9. **Offline Capability**: Should it work offline and sync when online?
yes
10. **Appwrite Setup**: Do you already have an Appwrite instance, or should I include setup instructions?
no please set it up for me too.

### Additional Features:
11. **Social Features**: Any sharing, community, or social aspects?
No
12. **Integrations**: Any fitness tracker integrations (Apple Health, Google Fit)?
Na
13. **Notifications**: Push notifications for fasting reminders, meal logging reminders?
Yes, lost of notifications. I want full control of notifications.
