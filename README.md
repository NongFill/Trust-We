# Trust-We 🐾🏠

**TH 🇹🇭** | แอปพลิเคชันสำหรับค้นหาบริการฝากสัตว์เลี้ยง / สิ่งของ ในบริเวณใกล้เคียงหรือสถานที่ที่ต้องการ  
**EN 🇬🇧** | A mobile app for finding pet or item boarding services near your location or at a specific area

> Built with **React Native (Expo)** — รองรับทั้ง iOS และ Android / Supports both iOS & Android

---

## 📱 About / เกี่ยวกับแอป

**TH 🇹🇭**  
**Trust-We** คือแพลตฟอร์มที่ช่วยให้ผู้ใช้สามารถค้นหาผู้รับฝากสัตว์เลี้ยงหรือสิ่งของในบริเวณใกล้เคียง หรือเลือกค้นหาตามสถานที่ที่ต้องการได้ โดยแสดงผลบนแผนที่แบบ Real-time พร้อมระบบจองและชำระเงินออนไลน์ในตัว

**EN 🇬🇧**  
**Trust-We** is a platform that connects users with pet or item boarding service providers nearby or at a specific location, displayed on a real-time map — with built-in booking and online payment systems.

---

## ✨ Features / ฟีเจอร์หลัก

### 👤 User Side / ฝั่งผู้ใช้บริการ

**TH 🇹🇭**
- ค้นหาบริการฝากสัตว์เลี้ยง/สิ่งของ ใกล้ตัวฉัน หรือในสถานที่ที่ระบุ
- ดูรายละเอียด, รีวิว และโปรไฟล์ของผู้รับฝาก
- จองบริการและเลือกวันเวลาที่ต้องการ
- ชำระเงินออนไลน์ผ่าน Stripe, Omise หรือ PromptPay QR
- ติดตามสถานะการฝากแบบ Real-time

**EN 🇬🇧**
- Search for boarding services near your location or at a specified area
- View details, reviews, and provider profiles
- Book services and select preferred date & time
- Pay online via Stripe, Omise, or PromptPay QR
- Track your boarding status in real-time

---

### 🏪 Service Provider Side / ฝั่งผู้ให้บริการ

**TH 🇹🇭**
- ลงทะเบียนและจัดการโปรไฟล์ร้าน/บริการ
- รับและจัดการคำขอฝากจากผู้ใช้
- ดู Dashboard สถิติรายรับและการจอง
- กำหนดพื้นที่และเงื่อนไขการให้บริการ

**EN 🇬🇧**
- Register and manage your service profile
- Receive and manage booking requests from users
- View income & booking statistics via dashboard
- Set your service area and conditions

---

---

## 📁 Project Structure / โครงสร้างโปรเจกต์

```
Trust-We/
├── screen_user/       # หน้าจอสำหรับผู้ใช้บริการ / User screens
├── screen_serve/      # หน้าจอสำหรับผู้ให้บริการ / Service provider screens
├── components/        # UI Components ที่ใช้ร่วมกัน / Shared UI components
├── functions/         # ฟังก์ชัน helper ต่างๆ / Helper functions
├── assets/            # รูปภาพ, ไอคอน / Images, icons, splash
├── Database/          # โครงสร้างฐานข้อมูล / Database config & structure
├── Server/            # Backend server files
├── App.js             # Entry point หลักของแอป / App entry point
├── UserDrawer.js      # Drawer Navigation
└── server.js          # Express server หลัก / Main Express server
```

---
