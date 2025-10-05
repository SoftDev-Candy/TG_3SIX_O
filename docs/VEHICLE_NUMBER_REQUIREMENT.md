# Vehicle Number Requirement - Kraków Transit

## 🚍 Why Vehicle Number is Mandatory

For **buses** and **trams** in Kraków, the vehicle number is **mandatory** because:

1. **Precise Identification**: Multiple vehicles operate on the same line simultaneously
2. **Accurate Reporting**: Without knowing which specific vehicle is delayed, the report is less actionable
3. **Cascade Effects**: A delayed vehicle on a line can cause downstream delays for other vehicles
4. **Maintenance Tracking**: Helps MPK Kraków identify specific vehicles with recurring issues
5. **Real-time Accuracy**: Enables more precise delay information for commuters

---

## 📋 Implementation

### Form Validation

**Buses & Trams:** Vehicle number is **required**
- Field shows red asterisk (*)
- Validation error if empty: "Vehicle number is required for buses and trams"
- Helper text: "The specific [bus/tram] number shown on the vehicle (mandatory for accurate reporting)"

**Trains & Metro:** Vehicle number is **optional**
- Field may be hidden or optional
- Different identification systems may apply

### Conditional Validation

```typescript
.refine(
  (data) => {
    // Vehicle number is mandatory for bus and tram
    if (data.transportType === 'bus' || data.transportType === 'tram') {
      return data.vehicleNumber && data.vehicleNumber.trim().length > 0;
    }
    return true;
  },
  {
    message: 'Vehicle number is required for buses and trams',
    path: ['vehicleNumber'],
  }
);
```

---

## 🎯 Real-World Example

**Scenario:** Tram Line 8 delay

**Without Vehicle Number:**
- ❌ "Tram Line 8 is delayed"
- Problem: Which of the 5+ trams on Line 8?
- Other trams on Line 8 may be running fine

**With Vehicle Number:**
- ✅ "Tram Line 8, Vehicle NG2341 is delayed"
- Benefit: Specific vehicle identified
- Other passengers can avoid that specific tram
- MPK Kraków knows exactly which vehicle to check

## 📝 Vehicle Number Format

Kraków MPK vehicles use an alphanumeric format:
- **Format:** 2 letters + 4 numbers (e.g., EY3983, NG2341, EU1889)
- **Letters:** Identify vehicle series or type
- **Numbers:** Unique identifier within series
- **Examples:** EY3983, NG2341, EU1889, KR4567

---

## 🔄 Cascade Effects

When **Tram Line 8, Vehicle NG2341** is delayed:
1. Vehicle NG2341 gets 15-minute delay
2. This causes Vehicle NG2342 (behind it) to slow down
3. Vehicle EU1889 (further back) is also affected
4. Reports with vehicle numbers help map the cascade

---

## 📊 Data Quality

**High-Quality Report:**
```json
{
  "line": "8",
  "vehicleNumber": "NG2341",
  "transportType": "tram",
  "severity": "moderate",
  "location": "Rynek Główny"
}
```

**Low-Quality Report:**
```json
{
  "line": "8",
  "vehicleNumber": null,  // ❌ Which tram?
  "transportType": "tram",
  "severity": "moderate",
  "location": "Rynek Główny"
}
```

---

## 🚦 User Experience

**Before (Optional):**
- Users might skip vehicle number
- Less accurate reports
- Harder to verify delays

**After (Mandatory):**
- Users must provide vehicle number
- Higher quality data
- Better delay tracking
- More actionable for MPK Kraków

---

## ✅ Quick Fill Integration

All demo scenarios include realistic vehicle numbers:
- **Tram 8** → NG2341
- **Tram 52** → EU1889
- **Bus 194** → EY3983
- **Train S1** → (optional/none)

---

**Status:** Implemented & Enforced  
**Priority:** CRITICAL for data quality  
**Compliance:** Matches real Kraków MPK requirements
