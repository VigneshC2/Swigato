# Swigato – Food Delivery Platform

Swigato is a food ordering and delivery platform I built as a set of independent microservices. Customers browse restaurants and order food, restaurants manage their menus and orders, delivery partners accept and track deliveries live, and a super admin oversees everything.

**Live demo:** [swigato-nine.vercel.app](https://swigato-nine.vercel.app)

> The backend runs on free-tier hosting and sleeps when idle, so the first request after a quiet period can take up to a minute. Payments run in Stripe test mode: use card `4242 4242 4242 4242`, any future expiry, any CVC.

**Author:** Vignesh Chaurasia · [@VigneshC2](https://github.com/VigneshC2)

---

## Features

- **Customers:** browse restaurants and menus, build a cart, place orders, pay online with Stripe, and track the order and the driver on a live map.
- **Restaurant admins:** register a restaurant, manage food items (with images), and view and update incoming orders.
- **Delivery partners:** see assigned deliveries, update delivery status, and share live location over WebSockets.
- **Super admin:** manage users and restaurants across the platform.
- **Notifications:** payment confirmations by email (Resend) and SMS (Twilio).
- **Auth:** JWT-based authentication with bcrypt-hashed passwords and role-based access (`customer`, `restaurant`, `delivery`, `admin`).

## Architecture

Each service has its own codebase, its own `package.json` and its own environment variables. All services share one MongoDB database server (separate connection per service) and trust the same `JWT_SECRET`.

```
 Browser ──► frontend (React) ───┬──► auth-service        /api/auth
                                 ├──► restaurant-service  /api/restaurant, /api/superAdmin, /api/food-items
                                 ├──► order-service       /api/orders, /api/users
                                 └──► payment-service     /api/payment  (+ Stripe webhook, Swagger at /api-docs)

 Browser ──► delivery-frontend ──► delivery-service        /api/auth, /api/delivery  (+ Socket.IO)
```

| Part | Folder | Default port |
|---|---|---|
| Auth service | `backend/auth-service` | 4000 |
| Restaurant service | `backend/restaurant-service` | 5002 |
| Delivery service (REST + Socket.IO) | `backend/delivery-service` | 5003 |
| Payment service | `backend/payment-service` | 5004 |
| Order service | `backend/order-service` | 5005 |
| Customer / restaurant web app | `frontend` | 3000 |
| Delivery partner web app | `delivery-frontend` | 3000 |

## Tech stack

- **Frontend:** React 19, React Router 7, Axios, Stripe Elements, Leaflet (maps), Socket.IO client
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose), including geospatial fields for driver location
- **Realtime:** Socket.IO
- **Payments:** Stripe (with webhooks)
- **Messaging:** Twilio (SMS), Resend (email)
- **Docs:** Swagger UI for the payment service
- **Deployment:** Render (backends), Vercel or Netlify (frontends); Dockerfile and Kubernetes manifests included for the payment service

## Run it locally

You need Node.js 18+, a MongoDB database (a free [Atlas](https://www.mongodb.com/atlas) cluster works), and a Stripe account in test mode. Twilio and Resend are only needed if you want SMS and email.

1. Clone the repo:
   ```bash
   git clone https://github.com/VigneshC2/Swigato.git
   cd Swigato
   ```
2. For each folder in `backend/`:
   ```bash
   cd backend/auth-service
   cp .env.example .env      # then fill in the values
   npm install
   npm start
   ```
   Use the **same `JWT_SECRET`** in every service. Repeat for `restaurant-service`, `order-service`, `delivery-service` and `payment-service`.
3. Start the frontends:
   ```bash
   cd frontend
   cp .env.example .env      # service URLs + Stripe publishable key
   npm install
   npm start
   ```
   Do the same in `delivery-frontend` (it only needs `REACT_APP_DELIVERY_URL`).

The frontends read every service address from `REACT_APP_*_URL` variables and fall back to `localhost` with the default ports above.

### Environment variables

| Service | Variables |
|---|---|
| auth | `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL` |
| restaurant | `PORT`, `MONGO_URI`, `JWT_SECRET` |
| order | `PORT`, `MONGO_URI`, `JWT_SECRET` |
| delivery | `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN` |
| payment | `PORT`, `MONGO_URI`, `CLIENT_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `RESEND_API_KEY` |
| frontend | `REACT_APP_AUTH_URL`, `REACT_APP_RESTAURANT_URL`, `REACT_APP_ORDER_URL`, `REACT_APP_PAYMENT_URL`, `REACT_APP_STRIPE_PUBLISHABLE_KEY` |
| delivery-frontend | `REACT_APP_DELIVERY_URL` |

Every folder has a `.env.example` listing exactly what it needs. Real `.env` files are gitignored and must never be committed.

### Testing payments

Use Stripe test mode and the card `4242 4242 4242 4242` with any future expiry and any CVC. More cards are listed in `backend/payment-service/test-card-details.md`. To receive webhooks locally:

```bash
stripe listen --forward-to localhost:5004/api/payment/webhook
```

Put the printed signing secret in `STRIPE_WEBHOOK_SECRET`. Swagger docs for the payment API are at `http://localhost:5004/api-docs`.

## Deployment

**Backends on Render.** `render.yaml` defines all five services. In Render choose New → Blueprint, select this repo, and fill in the environment variables it asks for. Set `CLIENT_URL` on auth and payment to your deployed frontend URL.

**Frontends on Vercel or Netlify.** Import the repo, set the root directory to `frontend` (and again to `delivery-frontend` for the second app), and set the `REACT_APP_*` variables to your Render URLs.

**Stripe webhook.** In the Stripe dashboard, add an endpoint at `https://<payment-service-url>/api/payment/webhook` and copy its signing secret into `STRIPE_WEBHOOK_SECRET`.

**Kubernetes (payment service).** Manifests are in `backend/payment-service/k8s/`. Copy `secrets.example.yaml` to `secrets.yaml`, fill it in, then `kubectl apply -f` the folder.

Free-tier notes: Render instances sleep when idle, so the first request can take around a minute. Restaurant images are stored on local disk and are lost on redeploy; move them to Cloudinary or S3 before real use.

## Repository layout

```
.
├── backend/
│   ├── auth-service/
│   ├── restaurant-service/
│   ├── order-service/
│   ├── delivery-service/
│   └── payment-service/      # also has Dockerfile, k8s/, tests
├── frontend/                 # customer + restaurant + admin app
├── delivery-frontend/        # delivery partner app
└── render.yaml
```

## Roadmap

- API gateway in front of the services
- Docker Compose file for one-command local startup
- Cloud image storage for restaurant photos
- Automated tests beyond the payment service

## Author

Built by **Vignesh Chaurasia** – [github.com/VigneshC2](https://github.com/VigneshC2) · vigneshchaurasia@gmail.com
