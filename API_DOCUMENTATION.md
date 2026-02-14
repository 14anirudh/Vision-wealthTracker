# API Documentation - Portfolio Tracker

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently no authentication required. Future versions will include JWT authentication.

---

## Endpoints

### Health Check

#### Check API Status
```http
GET /api/health
```

**Response:**
```json
{
  "status": "OK",
  "message": "Portfolio Tracker API is running"
}
```

---

## Portfolio Endpoints

### Get Current Portfolio

Retrieves the most recent portfolio entry.

```http
GET /api/portfolio/current
```

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "default",
  "equity": {
    "stocks": [
      {
        "name": "NIFTYBEES",
        "amount": 17224.20,
        "percentage": 21.31,
        "type": "Index"
      }
    ],
    "mutualFunds": [
      {
        "name": "ICICI Prudential",
        "amount": 12990.00,
        "percentage": 19.21,
        "type": "Equity",
        "subType": "Mid Cap"
      }
    ],
    "total": 80900.40
  },
  "nonEquity": {
    "cash": 10000.00,
    "bonds": [],
    "commodities": [],
    "total": 76900.15
  },
  "emergency": {
    "accounts": [
      {
        "name": "SBI Savings",
        "amount": 150000.00
      }
    ],
    "total": 349990.00
  },
  "grandTotal": 918242,
  "invested": 568252,
  "currentValue": 975803,
  "createdAt": "2026-02-14T10:30:00.000Z",
  "updatedAt": "2026-02-14T10:30:00.000Z"
}
```

**Error Response (404):**
```json
{
  "message": "No portfolio found"
}
```

---

### Get Portfolio History

Retrieves all portfolio entries sorted by date (newest first).

```http
GET /api/portfolio/history
```

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "default",
    "equity": { ... },
    "nonEquity": { ... },
    "emergency": { ... },
    "grandTotal": 918242,
    "createdAt": "2026-02-14T10:30:00.000Z"
  },
  { ... }
]
```

---

### Create Portfolio Entry

Creates a new portfolio entry.

```http
POST /api/portfolio
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "default",
  "equity": {
    "stocks": [
      {
        "name": "NIFTYBEES",
        "amount": 17224.20,
        "percentage": 21.31,
        "type": "Index"
      }
    ],
    "mutualFunds": []
  },
  "nonEquity": {
    "cash": 10000,
    "bonds": [],
    "commodities": []
  },
  "emergency": {
    "accounts": [
      {
        "name": "SBI Savings",
        "amount": 150000
      }
    ]
  },
  "invested": 500000,
  "currentValue": 550000
}
```

**Success Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "default",
  "equity": { ... },
  "nonEquity": { ... },
  "emergency": { ... },
  "grandTotal": 177224.20,
  "invested": 500000,
  "currentValue": 550000,
  "createdAt": "2026-02-14T10:30:00.000Z",
  "updatedAt": "2026-02-14T10:30:00.000Z"
}
```

**Error Response (400):**
```json
{
  "message": "Validation error message"
}
```

---

### Update Portfolio

Updates an existing portfolio entry.

```http
PUT /api/portfolio/:id
Content-Type: application/json
```

**URL Parameters:**
- `id` - Portfolio ID

**Request Body:** Same as Create Portfolio

**Success Response (200):** Updated portfolio object

**Error Response (400):** Validation error

---

### Delete Portfolio

Deletes a portfolio entry.

```http
DELETE /api/portfolio/:id
```

**URL Parameters:**
- `id` - Portfolio ID

**Success Response (200):**
```json
{
  "message": "Portfolio deleted"
}
```

---

## Returns Endpoints

### Get Monthly Returns

Retrieves monthly returns data for a specified period.

```http
GET /api/returns?months=12
```

**Query Parameters:**
- `months` (optional) - Number of months to retrieve (default: 12)

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "default",
    "year": 2026,
    "month": 1,
    "returns": {
      "stocks": 4500,
      "mutualFunds": 2500,
      "commodities": 6200,
      "bonds": 1500,
      "total": 14700
    },
    "invested": 568252,
    "currentValue": 582952,
    "totalReturns": 14700,
    "returnsPercentage": 2.59,
    "createdAt": "2026-01-31T23:59:00.000Z"
  },
  { ... }
]
```

---

### Get Returns Summary

Retrieves aggregated returns summary across all periods.

```http
GET /api/returns/summary
```

**Success Response (200):**
```json
{
  "totalReturns": 53529.26,
  "byCategory": {
    "stocks": 19288.14,
    "mutualFunds": 8.00,
    "commodities": 40233.12,
    "bonds": 0
  },
  "monthlyData": [ ... ]
}
```

---

### Add Monthly Return

Creates a new monthly return entry.

```http
POST /api/returns
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "default",
  "year": 2026,
  "month": 2,
  "returns": {
    "stocks": 5000,
    "mutualFunds": 2800,
    "commodities": 6500,
    "bonds": 1600,
    "total": 15900
  },
  "invested": 580000,
  "currentValue": 595900,
  "totalReturns": 15900,
  "returnsPercentage": 2.74
}
```

**Success Response (201):** Created return entry

**Error Response (400):** Validation error

**Note:** The combination of userId, year, and month must be unique.

---

### Update Monthly Return

Updates an existing monthly return entry.

```http
PUT /api/returns/:id
Content-Type: application/json
```

**URL Parameters:**
- `id` - Return entry ID

**Request Body:** Same as Add Monthly Return

**Success Response (200):** Updated return entry

---

## Data Models

### Portfolio Schema

```typescript
{
  userId: string (default: 'default')
  date: Date (default: now)
  
  equity: {
    stocks: [{
      name: string (required)
      amount: number (required)
      percentage: number
      type: string
      subType: string
    }]
    mutualFunds: [{
      name: string (required)
      amount: number (required)
      percentage: number
      type: string
      subType: string
    }]
    total: number (auto-calculated)
  }
  
  nonEquity: {
    cash: number (default: 0)
    bonds: [{
      name: string (required)
      amount: number (required)
      percentage: number
    }]
    commodities: [{
      name: string (required)
      amount: number (required)
      percentage: number
    }]
    total: number (auto-calculated)
  }
  
  emergency: {
    accounts: [{
      name: string (required)
      amount: number (required)
    }]
    total: number (auto-calculated)
  }
  
  grandTotal: number (auto-calculated)
  invested: number (default: 0)
  currentValue: number (auto-calculated)
  
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Monthly Return Schema

```typescript
{
  userId: string (default: 'default')
  year: number (required)
  month: number (required, 1-12)
  
  returns: {
    stocks: number (default: 0)
    mutualFunds: number (default: 0)
    commodities: number (default: 0)
    bonds: number (default: 0)
    total: number (default: 0)
  }
  
  invested: number (default: 0)
  currentValue: number (default: 0)
  totalReturns: number (default: 0)
  returnsPercentage: number (default: 0)
  
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Unique Index:** userId + year + month

---

## Error Codes

| Status Code | Description |
|------------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request / Validation error |
| 404 | Resource not found |
| 500 | Internal server error |

---

## Example Usage

### Using cURL

**Get current portfolio:**
```bash
curl http://localhost:5000/api/portfolio/current
```

**Create portfolio:**
```bash
curl -X POST http://localhost:5000/api/portfolio \
  -H "Content-Type: application/json" \
  -d '{
    "equity": {
      "stocks": [{"name": "Test Stock", "amount": 10000}],
      "mutualFunds": []
    },
    "nonEquity": {
      "cash": 5000,
      "bonds": [],
      "commodities": []
    },
    "emergency": {
      "accounts": [{"name": "Emergency", "amount": 50000}]
    },
    "invested": 65000
  }'
```

### Using JavaScript (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Get current portfolio
const portfolio = await api.get('/portfolio/current');
console.log(portfolio.data);

// Create new portfolio
const newPortfolio = await api.post('/portfolio', {
  equity: { /* ... */ },
  nonEquity: { /* ... */ },
  emergency: { /* ... */ }
});
```

---

## Rate Limiting

Currently no rate limiting. Consider implementing in production.

## CORS

CORS is enabled for all origins in development. Configure appropriately for production.

---

**API Version:** 1.0.0  
**Last Updated:** February 2026


