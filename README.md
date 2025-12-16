<h1 align="center">
  <img
    width="300"
    alt="CleverLounge"
    src="https://raw.githubusercontent.com/thelounge/thelounge/master/client/img/logo-vertical-transparent-bg.svg?sanitize=true">
</h1>

<h3 align="center">
  CleverLounge: MAM Edition
</h3>

<h4 align="center">
  Purpose-built IRC monitoring platform for MyAnonamouse<br>
  Based on The Lounge modern web IRC client
</h4>

<p align="center">
  <strong>
    <a href="https://thelounge.chat/">Original The Lounge</a>
    •
    <a href="https://thelounge.chat/docs">Base Documentation</a>
    •
    <a href="https://www.myanonamouse.net">MyAnonamouse</a>
  </strong>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/thelounge/thelounge.github.io/master/img/thelounge-screenshot.png" width="550">
</p>

## 🐭 CleverLounge Features

**MAM-Specific Enhancements:**

- 🎨 **Official MAM class colors** - Exact styling from MyAnonamouse website
- 📊 **Intelligent userlist grouping** - Organize by tracker class (Dev, SysOp, Admin, Mod, VIP, User, Mouse)
- 🎯 **Queue detection** - Dedicated sections for Support Queue (#help) and Invite Queue (#anonamouse.net)
- 🔍 **Hostmask parsing** - Automatic MAM class detection from `user@class.type.mam` patterns
- 💾 **Hostmask caching** - Persistent cache of 1300+ MAM users with localStorage sync
- 📈 **SQLite integration** - Historical log analysis and analytics
- 🎭 **MAM badges** - Visual indicators with icons and short codes
- 📜 **Infinite scrollback** - Beyond standard IRC limits
- ⚡ **Auto-WHOIS** - Automatic hostmask collection on join
- 🎨 **Discord theme** - Modern dark UI matching Discord 2024+
- 📊 **PHP Analytics Dashboard** - Multi-tab queue analysis and statistics
- 🛠️ **Custom commands** - `/history` and more

**Core The Lounge Features:**

- **Modern IRC features** - Push notifications, link previews, new message markers
- **Always connected** - Remains connected while you're offline
- **Cross platform** - Works wherever Node.js runs
- **Responsive interface** - Desktop, smartphone, and tablet friendly
- **Synchronized experience** - Resume where you left off on any device

## 📦 Installation

### Prerequisites

- Latest [Node.js](https://nodejs.org/) LTS version or more recent
- [Yarn package manager](https://yarnpkg.com/) (recommended)
- Git for cloning the repository

### Running CleverLounge

Clone the repository
git clone https://github.com/CleverDinoProductions/CleverLounge.git
cd CleverLounge

Install dependencies
yarn install

Build for production
NODE_ENV=production yarn build

Start the server
yarn start

When installed like this, `thelounge` executable is not created. Use `node index <command>` to run commands.

### Initial Setup

Create your first user
node index add <username>

Configure networks and channels
Edit ~/.thelounge/config.js for global settings

## 🔧 MAM Configuration

### Enable MAM Features

CleverLounge automatically detects MAM channels by:

- Hostmask patterns containing `.mam`
- Channel names: `#help`, `#anonamouse.net`, `#announce`

### Hostmask Caching

1. Connect to MAM IRC network
2. CleverLounge will automatically cache hostmasks as users join/speak
3. For bulk caching, use browser console:
   // Export cache
   const cache = localStorage.getItem('hostmaskCache');
   console.log(cache);

   // Import cache
   localStorage.setItem('hostmaskCache', 'your_cache_json_here');

### Channel-Specific Behavior

- **#help** - Shows "Support Queue" section for +v users
- **#anonamouse.net** - Shows "Invite Queue" section for +v users
- **Other MAM channels** - Groups by tracker class automatically

## 🎨 Customization

### Theme Selection

CleverLounge includes several themes:

- `discord` - Discord-inspired dark theme (recommended for MAM)
- `morning` - Light theme for daytime use
- `default` - Classic IRC look

All themes support MAM features automatically (colors, grouping, badges).

### MAM Class Colors

MAM class styling is in `client/css/style.css` using official MyAnonamouse colors:
.mam-class-dev { background-color: #336699; }
.mam-class-admin { background-color: #30AA0F; }
/_ ... all classes included _/

## 🛠️ Development

### Development Setup

Clone and install
git clone https://github.com/CleverDinoProductions/CleverLounge.git
cd CleverLounge
yarn install

Start with hot reload
yarn dev

Build client changes
yarn build:client

Build server changes
yarn build:server

Run tests
yarn test

### Project Structure

CleverLounge/
├── client/
│ ├── components/
│ │ ├── ChatUserList.vue # MAM userlist grouping
│ │ └── Username.vue # MAM badges & colors
│ ├── css/
│ │ └── style.css # Global MAM styling
│ ├── themes/
│ │ ├── discord.css # Discord theme
│ │ └── morning.css # Light theme
│ └── js/
│ ├── hostmaskCache.ts # Hostmask persistence
│ └── types.d.ts # TypeScript definitions
├── server/
└── shared/

text

### Key Files Modified from The Lounge

- `client/components/ChatUserList.vue` - Intelligent grouping logic
- `client/components/Username.vue` - MAM class detection & badges
- `client/js/types.d.ts` - Channel metadata types
- `client/css/style.css` - MAM class colors & styling
- `client/js/hostmaskCache.ts` - Persistent hostmask storage

## 📊 PHP Analytics Dashboard

CleverLounge integrates with a PHP analytics dashboard for queue monitoring:

E:/
├── CleverLounge/ # This repository
└── htdocs/
└── mam/
└── dashboard/ # PHP analytics

text

Connect the SQLite database at `~/.thelounge/logs/*.sqlite3` to the dashboard for:

- Queue wait time analysis
- Invite window tracking (Wed/Thu & Sat/Sun)
- Historical statistics
- Live queue monitoring

## 🤝 Contributing

CleverLounge is a personal fork optimized for MAM IRC monitoring. If you want to:

- **Use CleverLounge** - Feel free to fork and customize!
- **Report MAM-specific bugs** - Open an issue
- **Contribute to base The Lounge** - Visit [thelounge/thelounge](https://github.com/thelounge/thelounge)

## 📝 Credits

- **The Lounge** - Original IRC client by [thelounge/thelounge](https://github.com/thelounge/thelounge)
- **Shout** - Original project by [Mattias Erming](https://github.com/erming)
- **MyAnonamouse** - Color scheme and class system inspiration
- **CleverDinoProductions** - MAM customizations and enhancements

## ⚠️ Disclaimer

This is a personal customization fork designed for MyAnonamouse IRC monitoring. Not affiliated with or endorsed by The Lounge project or MyAnonamouse.

## 📄 License

Licensed under MIT - see [LICENSE](LICENSE) file for details.

<p align="center">
  Made with 🐭 for the MyAnonamouse community
</p>
