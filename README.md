# Calendar

A modern, clean, and feature-rich calendar application built with React Native and Expo. Designed to work completely offline with a Google Calendar-like interface and functionality.

## Features

### 📅 Multiple View Modes
- **Month View**: Traditional calendar grid with events displayed as colored dots
- **Week View**: Detailed weekly view with time slots and event positioning
- **Day View**: Focused daily view with hourly time slots

### 🎨 Clean & Modern Design
- Sleek, minimalist interface inspired by Google Calendar
- Smooth animations and transitions
- Responsive design that works on all screen sizes
- Beautiful color-coded calendars and events

### 📱 Cross-Platform Support
- **Mobile**: iOS and Android support via React Native
- **Web**: Full web support via Expo Web
- Consistent experience across all platforms

### 🔄 Offline-First Architecture
- Complete offline functionality using AsyncStorage
- No internet connection required
- Data persistence across app sessions
- Designed for future synchronization with Supabase

### 📝 Event Management
- Create, edit, and delete events
- All-day and timed events
- Event descriptions and locations
- Color-coded events based on calendar
- Quick event creation by tapping dates/time slots

### 📚 Calendar Management
- Multiple calendars with custom names and colors
- Show/hide calendars independently
- Default calendar for new events
- Calendar statistics and management

### 🎯 Google Calendar-Like Features
- Intuitive event creation workflow
- Calendar visibility toggles
- Color-coded organization
- Time slot interactions
- Event editing and deletion

## Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: React Context + useReducer
- **Storage**: AsyncStorage (offline)
- **Date Handling**: date-fns
- **UI Components**: React Native built-in components
- **Icons**: Expo Vector Icons
- **Future Sync**: Supabase (planned)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── CalendarHeader.tsx
│   ├── MonthView.tsx
│   ├── WeekView.tsx
│   ├── DayView.tsx
│   ├── EventFormModal.tsx
│   ├── CalendarFormModal.tsx
│   └── CalendarListModal.tsx
├── contexts/           # React Context providers
│   └── CalendarContext.tsx
├── screens/           # Main application screens
│   └── CalendarScreen.tsx
├── services/          # Data services
│   └── storage.ts
├── types/            # TypeScript type definitions
│   └── index.ts
└── utils/            # Utility functions
    ├── dateUtils.ts
    └── helpers.ts
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd calendar
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

### Running on Different Platforms

- **Web**: `npm run web`
- **iOS**: `npm run ios` (requires macOS and Xcode)
- **Android**: `npm run android` (requires Android Studio)

## Usage

### Creating Events
1. Tap the "+" button in the header
2. Or tap on any date in month view
3. Or tap on any time slot in week/day view
4. Fill in event details and save

### Managing Calendars
1. Tap the calendar icon in the header to create new calendars
2. Tap the list icon to view and manage existing calendars
3. Toggle calendar visibility with switches
4. Edit calendar names and colors

### Navigation
- Use the arrow buttons to navigate between time periods
- Tap the date/month text to quickly return to today
- Switch between Day, Week, and Month views using the toggle buttons

## Architecture Decisions

### Offline-First Design
The application is built with an offline-first approach using AsyncStorage for data persistence. This ensures:
- Immediate responsiveness
- No dependency on internet connectivity
- Data safety and reliability
- Easy migration to cloud sync in the future

### Component Architecture
- **Modular Design**: Each view mode is a separate component
- **Reusable Components**: Common UI elements are abstracted
- **Context-Based State**: Centralized state management with React Context
- **TypeScript**: Full type safety throughout the application

### Future Synchronization
The architecture is designed to easily integrate with Supabase for cloud synchronization:
- Storage service abstraction allows easy backend integration
- UUID-based IDs for conflict resolution
- Timestamp tracking for sync operations
- Offline-first approach maintains functionality during sync

## Development

### Code Style
- TypeScript for type safety
- Functional components with hooks
- Consistent naming conventions
- Comprehensive error handling

### Testing
Run tests with:
```bash
npm test
```

### Building for Production
```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

### Phase 1 (Current)
- ✅ Basic calendar functionality
- ✅ Offline storage
- ✅ Multiple view modes
- ✅ Event and calendar management

### Phase 2 (Planned)
- 🔄 Supabase integration for cloud sync
- 🔄 User authentication
- 🔄 Shared calendars
- 🔄 Event reminders and notifications

### Phase 3 (Future)
- 🔄 Recurring events
- 🔄 Calendar import/export
- 🔄 Advanced search and filtering
- 🔄 Team collaboration features

## Support

For support, please open an issue on the GitHub repository or contact the development team.

---

Built with ❤️ using React Native and Expo 