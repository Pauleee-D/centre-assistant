# Adding Knowledge to Your Leisure Centre Assistant

## How to Add New Information

Your knowledge base is stored in Upstash Vector database. To add new information:

### 1. Edit the JSON File

Open `data/knowledge.json` and add your items:

```json
[
  {
    "id": "centre-name-facilities",
    "title": "Centre Name - Facilities",
    "content": "Detailed description of facilities available at this centre."
  },
  {
    "id": "centre-name-classes",
    "title": "Centre Name - Classes",
    "content": "List of classes offered at this centre with times."
  }
]
```

### 2. Run the Script

```bash
npm run add-knowledge
```

This will upload all the knowledge items from the JSON file to your Upstash Vector database.

## Organizing 58 Centres

For your 58 centres, structure your data like this:

```json
[
  {
    "id": "citycentre-facilities",
    "title": "City Centre Leisure - Facilities",
    "content": "City Centre Leisure offers a 25m pool, gym, sauna, steam room, and sports hall."
  },
  {
    "id": "citycentre-classes",
    "title": "City Centre Leisure - Classes",
    "content": "Classes available: Yoga Mon/Wed 6pm, Spin Tue/Thu 7pm, Pilates Fri 5pm."
  },
  {
    "id": "citycentre-hours",
    "title": "City Centre Leisure - Opening Hours",
    "content": "Open Mon-Fri 6am-10pm, Weekends 7am-9pm."
  },
  {
    "id": "parkside-facilities",
    "title": "Parkside Sports Centre - Facilities",
    "content": "Parkside has a 50m Olympic pool, climbing wall, tennis courts."
  }
]
```

## Tips

- Use unique IDs: `{centre-name}-{category}` (e.g., `citycentre-facilities`)
- Create separate entries for: facilities, classes, hours, memberships, prices
- Make content descriptive and include the centre name
- Running the script multiple times is safe - it will update existing items with the same ID
- The script will show a summary of items added/failed
