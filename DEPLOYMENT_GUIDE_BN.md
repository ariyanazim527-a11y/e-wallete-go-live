# E-wallet Go: ডোমেইন ও হোস্টিং সেটআপের সম্পূর্ণ গাইড (Deployment Guide)

অভিনন্দন! আপনার **E-wallet Go (কাস্টমার ওয়ালেট, এজেন্ট টার্মিনাল ও সুপার অ্যাডমিন কনসোল)** অ্যাপটি সম্পূর্ণভাবে প্রস্তুত এবং প্রোডাকশন-রেডি। নিচে ডোমেইন ও হোস্টিং কেনা থেকে শুরু করে লাইভ করার পূর্ণাঙ্গ গাইড দেওয়া হলো:

---

## 📌 ১. ডোমেইন ও হোস্টিং কোথা থেকে কিনবেন?

### ক) ডোমেইন কেনার সেরা মাধ্যম:
1. **আন্তর্জাতিক প্রোভাইডার:** [Namecheap](https://www.namecheap.com), [Cloudflare](https://www.cloudflare.com), [Hostinger](https://www.hostinger.com) (ডলার/মাস্টারকার্ড থাকলে)।
2. **বাংলাদেশি প্রোভাইডার (বিকাশ/নগদ দিয়ে কেনা যায়):** ExonHost, DianaHost, XeonBD, WebHostBD ইত্যাদি।
   - *পরামর্শকৃত নাম:* `ewalletgo.com`, `ewalletbd.com`, `ewallet.com.bd`

### খ) হোস্টিং নির্বাচন (৩টি সহজ বিকল্প):

| মাধ্যম | সুবিধা | যাদের জন্য উপযুক্ত |
|---|---|---|
| **বিকল্প ১: Vercel / Render (ক্লাউড হোস্টিং)** | অটোমেটিক ফ্রি SSL, সার্ভার মেইনটেন্যান্স নেই, গিটহাবে কোড দিলেই অটো লাইভ। | সবচেয়ে সহজ ও আধুনিক |
| **বিকল্প ২: VPS হোস্টিং (Hostinger VPS / DigitalOcean)** | সম্পূর্ণ নিজস্ব সার্ভার, আনলিমিটেড ইউজার, ফুল কন্ট্রোল। (মাসে $৪-$৬) | দীর্ঘমেয়াদী বড় ব্যবসার জন্য সেরা |
| **বিকল্প ৩: cPanel হোস্টিং (Node.js সাপোর্টেড)** | চেনা ইন্টারফেস, সিপ্যানেলের "Setup Node.js App" দিয়ে চালানো যায়। | যারা সাধারণ সিপ্যানেলে অভ্যস্ত |

---

## 🚀 ২. বিকল্প ১: Render / Vercel-এ লাইভ করার সহজ নিয়ম (সবচেয়ে দ্রুত)

1. [GitHub](https://github.com)-এ একটি অ্যাকাউন্ট খুলে এই প্রজেক্টের কোড একটি নতুন রিপোজিটরিতে আপলোড করুন।
2. [Render.com](https://render.com) বা [Vercel.com](https://vercel.com)-এ ফ্রি সাইন-আপ করুন।
3. **New Web Service** চাপুন এবং আপনার GitHub রিপোজিটরি সিলেক্ট করুন।
4. সেটিংস দিন:
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. **Deploy** বাটনে চাপ দিন। ৩ মিনিটের মধ্যে আপনার ওয়েবসাইট বিশ্বব্যাপী লাইভ হয়ে যাবে!
6. এরপর **Custom Domain** অপশনে গিয়ে আপনার কেনা ডোমেইনটি (যেমন: `www.ewalletgo.com`) যুক্ত করে দিন।

---

## 🖥️ ৩. বিকল্প ২: VPS সার্ভারে (Ubuntu / Hostinger VPS) লাইভ করার নিয়ম

আপনার কেনা VPS সার্ভারে SSH দিয়ে লগইন করুন এবং নিচের কমান্ডগুলো দিন:

### ধাপ ১: Node.js ও Git ইনস্টল করুন
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx
sudo npm install -g pm2
```

### ধাপ ২: প্রজেক্ট কোড নামিয়ে বিল্ড করুন
```bash
# প্রজেক্ট ফোল্ডারে প্রবেশ করুন
cd /var/www/
git clone <আপনার_গিটহাব_লিংক> ewallet-go
cd ewallet-go

# ডিপেন্ডেন্সি ইনস্টল ও প্রোডাকশন বিল্ড
npm install
npm run build
```

### ধাপ ৩: PM2 দিয়ে অ্যাপটি চালু রাখুন (২৪/৭ ব্যাকগ্রাউন্ডে চলবে)
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### ধাপ ৪: Nginx কনফিগারেশন সেট করুন
প্রজেক্টের ভেতর তৈরি করা `nginx.conf` ফাইলটি Nginx-এ বসিয়ে দিন:
```bash
sudo cp nginx.conf /etc/nginx/sites-available/ewalletgo
sudo ln -s /etc/nginx/sites-available/ewalletgo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### ধাপ ৫: ফ্রি SSL (HTTPS 🔒) ইনস্টল করুন
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
*(আপনার ডোমেইনে ফ্রি সবুজ তালা 🔒 বা SSL সার্টিফিকেট চালু হয়ে যাবে!)*

---

## 🐳 বিকল্প ৩: ডকার (Docker) দিয়ে ১-ক্লিকে চালানো

যদি আপনার সার্ভারে Docker থাকে, তবে প্রজেক্ট ফোল্ডারে গিয়ে কেবল এই একটি কমান্ড দিলেই পুরো অ্যাপ চালু হয়ে যাবে:
```bash
docker compose up -d --build
```

---

## 🌐 ৪. ডোমেইনের DNS কীভাবে পয়েন্ট করবেন?

আপনার ডোমেইন কন্ট্রোল প্যানেলে (Namecheap/Cloudflare/cPanel) যান:
1. **Type:** `A Record`
   - **Host:** `@`
   - **Value:** `আপনার হোস্টিং/VPS সার্ভারের IP অ্যাড্রেস`
2. **Type:** `CNAME Record`
   - **Host:** `www`
   - **Value:** `yourdomain.com`

---

## 📱 ৫. লাইভ হওয়ার পর লিংকসমূহ ও মোবাইল অ্যাপ ইনস্টলেশন:

ডোমেইন কানেক্ট হওয়ার পর:
- **গ্রাহক ওয়ালেট:** `https://yourdomain.com/#/customer`
- **এজেন্ট টার্মিনাল:** `https://yourdomain.com/#/agent`
- **অ্যাডমিন কন্ট্রোল:** `https://yourdomain.com/#/admin`
- **টেলিগ্রাম হেল্পলাইন:** `https://t.me/Ewallatehelpline`
- **অফিসিয়াল সেন্ড মানি:** `01739-420736`

**মোবাইল অ্যাপ ইনস্টল:**
যেকোনো মোবাইল থেকে `https://yourdomain.com` ওপেন করলেই ক্রোম ব্রাউজার সরাসরি **"Install App"** প্রম্পট দেবে। ব্যবহারকারী বা এজেন্ট মাত্র ১ ক্লিকেই মোবাইলের হোম স্ক্রিনে বিকাশ/নগদের মতো রিয়েল অ্যাপ আইকন পেয়ে যাবে!
