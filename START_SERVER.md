# ?? How to Start the Server - Super Simple Guide

## Quick Commands

### Go to project folder:
```bash
cd /workspace
```

### Start the server:
```bash
npm run dev
```

### Open browser:
```
http://localhost:3000
```

---

## Common Errors & Solutions

### Error: "npm: command not found"

**What it means:** Node.js is not installed

**How to fix:**
1. Go to: https://nodejs.org
2. Click the big green button that says "Download"
3. Install it (just click Next, Next, Next)
4. Close terminal and open it again
5. Try `npm run dev` again

---

### Error: "Cannot find module"

**What it means:** Dependencies not installed

**How to fix:**
```bash
npm install
```
Wait for it to finish, then:
```bash
npm run dev
```

---

### Error: "Port 3000 is already in use"

**What it means:** Something else is using port 3000

**How to fix:**

**Option 1 - Use a different port:**
```bash
PORT=3001 npm run dev
```
Then open: http://localhost:3001

**Option 2 - Kill the process using port 3000:**

**On Mac:**
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

**On Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID [the_number_you_see] /F
npm run dev
```

---

### Error: "EADDRINUSE"

Same as "Port already in use" above.

---

### Error: About Prisma or DATABASE_URL

**How to fix:**
```bash
npx prisma migrate dev
npm run dev
```

---

## Still Not Working?

### Check these:

1. **Are you in the right folder?**
   ```bash
   ls
   ```
   Should show: app, lib, prisma, package.json

2. **Did npm install finish?**
   ```bash
   npm install
   ```
   Wait for "added X packages"

3. **Is Node.js installed?**
   ```bash
   node --version
   ```
   Should show: v18.x.x or higher

4. **Try this full reset:**
   ```bash
   # Kill any running servers
   pkill -f "next dev"
   
   # Clean and restart
   rm -rf .next
   npm install
   npm run dev
   ```

---

## Visual Guide

### What Your Terminal Should Look Like When Working:

```
$ cd /workspace
$ npm run dev

> llama-connect@1.0.0 dev
> next dev

   ? Next.js 14.0.4
   - Local:        http://localhost:3000

 ? Ready in 2.5s
```

### What Your Browser Should Show:

```
Address bar: http://localhost:3000

Page shows:
?? Llama Connect
[Big hero section with buttons]
```

---

## Quick Troubleshooting Flowchart

```
Start Here
    ?
Is terminal open?
    NO ? Open terminal
    YES ?
        ?
Are you in /workspace folder?
    NO ? cd /workspace
    YES ?
        ?
Did you run npm install?
    NO ? npm install (wait to finish)
    YES ?
        ?
Run: npm run dev
    ?
Do you see "Ready in X.Xs"?
    NO ? Check error messages above
    YES ?
        ?
Open browser: http://localhost:3000
    ?
Do you see the homepage?
    YES ? SUCCESS! ??
    NO ? Check if port 3000 is blocked
```

---

## Need More Help?

Take a screenshot of:
1. Your terminal window (showing the error)
2. Your browser showing the error
3. The result of running: `ls` in your project folder

Then you can see exactly what's wrong!
