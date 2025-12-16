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

### Migration Methods

## Method 1: Point CleverLounge at Existing Data (Recommended)

Keep your existing data, just change the code:

# Clone CleverLounge

git clone https://github.com/CleverDinoProductions/CleverLounge.git
cd CleverLounge

# Install dependencies

yarn install

# Build CleverLounge

NODE_ENV=production yarn build

# Run CleverLounge pointing at your existing data

THELOUNGE_HOME=/home/username/.thelounge yarn start

What happens:

✅ Uses your existing config.js

✅ Keeps all your users and passwords

✅ Maintains all IRC connections

✅ Preserves all logs and history

✅ No data migration needed

On Windows:

set THELOUNGE_HOME=C:\Users\YourName\.thelounge
yarn start

## Method 2: Run Both Side-by-Side (Testing)

Test CleverLounge without affecting your production setup:

# Create separate data directory for testing

mkdir ~/.cleverlounge

# Run CleverLounge with test data

THELOUNGE_HOME=/home/username/.cleverlounge yarn start --port 9001

# Your original The Lounge still runs on port 9000

Now you have:

Original The Lounge: http://localhost:9000 (production)

CleverLounge: http://localhost:9001 (testing)

To migrate later:

# Copy your data to CleverLounge

cp -r ~/.thelounge/\* ~/.cleverlounge/

# Or just switch to using ~/.thelounge

THELOUNGE_HOME=/home/username/.thelounge yarn start

## Method 3: Replace System Installation

For users who installed The Lounge globally with npm:

# Stop your current The Lounge

sudo systemctl stop thelounge

# or

pm2 stop thelounge

# Clone CleverLounge

git clone https://github.com/CleverDinoProductions/CleverLounge.git /opt/cleverlounge
cd /opt/cleverlounge

# Install and build

yarn install
NODE_ENV=production yarn build

# Run as service (systemd example)

sudo systemctl edit thelounge.service
Edit service file to point to CleverLounge:

[Service]
ExecStart=/usr/bin/node /opt/cleverlounge/index.js start
Environment="THELOUNGE_HOME=/home/thelounge/.thelounge"
text

# Restart with CleverLounge code

sudo systemctl start thelounge

## 🔄 Migrating from The Lounge

Already using The Lounge? You can switch to CleverLounge without losing any data!

### Quick Migration (Existing Data)

CleverLounge uses the **same data format** as The Lounge. Just point it at your existing data directory:

Clone CleverLounge
git clone https://github.com/CleverDinoProductions/CleverLounge.git
cd CleverLounge
yarn install
NODE_ENV=production yarn build

Run with your existing data
THELOUNGE_HOME=/path/to/your/.thelounge yarn start

**On Windows:**
set THELOUNGE_HOME=C:\Users\YourName.thelounge
yarn start

### What Gets Preserved

✅ **All user accounts** - Existing logins work immediately  
✅ **Network configurations** - All IRC connections maintained  
✅ **Channel history** - SQLite logs and text files preserved  
✅ **Settings** - Themes, notifications, preferences  
✅ **Uploads** - Any uploaded files  
✅ **Hostmask cache** - If using CleverLounge's caching system

### What Changes

🎨 **New MAM features** - Class grouping, badges, colors  
🐭 **Auto-detection** - MAM channels automatically enhanced  
📊 **Userlist grouping** - Organizes by class instead of IRC mode

### Testing Before Switching

Want to try CleverLounge without affecting your production setup?

Create test data directory
mkdir ~/.cleverlounge

Copy your existing data (optional)
cp -r ~/.thelounge/\* ~/.cleverlounge/

Run CleverLounge on different port
THELOUNGE_HOME=/home/username/.cleverlounge yarn start --port 9001

Now you have:

- **Original The Lounge**: `http://localhost:9000`
- **CleverLounge (test)**: `http://localhost:9001`

### System Service Users

If you run The Lounge as a systemd service:

Stop current service
sudo systemctl stop thelounge

Clone CleverLounge
sudo git clone https://github.com/CleverDinoProductions/CleverLounge.git /opt/cleverlounge
cd /opt/cleverlounge
sudo yarn install
sudo NODE_ENV=production yarn build

Update service to use CleverLounge
sudo nano /etc/systemd/system/thelounge.service

Change `ExecStart` to point to CleverLounge:
[Service]
ExecStart=/usr/bin/node /opt/cleverlounge/index.js start
Environment="THELOUNGE_HOME=/var/lib/thelounge"

Reload and restart
sudo systemctl daemon-reload
sudo systemctl start thelounge

### Docker Users

If using The Lounge Docker container:

Use CleverLounge instead of official image
FROM node:20

Clone CleverLounge
RUN git clone https://github.com/CleverDinoProductions/CleverLounge.git /opt/cleverlounge
WORKDIR /opt/cleverlounge

Install and build
RUN yarn install &&
NODE_ENV=production yarn build

Use existing volume for data
VOLUME /var/opt/thelounge
ENV THELOUNGE_HOME=/var/opt/thelounge

EXPOSE 9000
CMD ["yarn", "start"]

Mount your existing data:
docker run -d
--name cleverlounge
-v ~/.thelounge:/var/opt/thelounge
-p 9000:9000
cleverlounge:latest

### Switching Back

Don't like CleverLounge? Switch back anytime:

Stop CleverLounge
Start original The Lounge with same data directory
thelounge start

Your data is **never locked** to CleverLounge. It's fully compatible with standard The Lounge!

### Import Hostmask Cache (Optional)

To get instant MAM features, import the pre-built cache:

1. Download [mam-hostmask-cache.json](https://github.com/CleverDinoProductions/CleverLounge/releases)
2. Open CleverLounge in browser
3. Press F12 → Console
4. Run:
   fetch('path/to/mam-hostmask-cache.json')
   .then(r => r.json())
   .then(data => {
   localStorage.setItem('hostmaskCache', JSON.stringify(data.cache));
   console.log('✅ Cache imported!');
   });

### Troubleshooting

**"Cannot find module" errors:**

- Run `yarn install` in CleverLounge directory

**Port already in use:**

- Stop original The Lounge first, or use `--port 9001`

**Login not working:**

- Verify `THELOUNGE_HOME` points to correct directory
- Check file permissions on data directory

**MAM features not appearing:**

- Import hostmask cache (see above)
- Join a MAM channel and wait for WHOIS responses

### Need Help?

- Check [Issues](https://github.com/CleverDinoProductions/CleverLounge/issues)
- Read [The Lounge documentation](https://thelounge.chat/docs)
- Compare your setup with the [Project Structure](#project-structure)

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
