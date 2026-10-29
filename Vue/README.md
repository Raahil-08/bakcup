# Practical 7: Vue.js Custom Directives

This practical demonstrates how to create and use custom directives through a
standalone HTML page using Vue 3.

## Files

- `trips.html` - Complete Vue.js practical implementation.

## Demonstrated functionality

1. **`v-uppercase`** - Click a city name to change its text to uppercase.
   Keyboard activation with `Enter` or `Space` is also supported.
2. **Dynamic list** - `v-for` renders trips from the reactive `trips` array.
   The **Add Sample Trip** button updates the list without reloading the page.
3. **`v-highlight`** - Upcoming trips receive a highlighted card style based on
   the directive value.
4. **`v-format-date`** - ISO dates such as `2026-08-14` are displayed as
   `14 Aug 2026`.
5. **Vue fundamentals commonly asked in practical exams**:
   - text interpolation with `{{ }}`;
   - event handling with `@click` and `@submit.prevent`;
   - attribute and class binding with `v-bind`/`:`;
   - two-way form binding with `v-model`;
   - conditional rendering with `v-if`, `v-else`, and `v-show`;
   - computed properties for filtering and counting;
   - methods for adding, deleting, and updating trips;
   - a reusable component receiving values through props.

## Quick viva/practical mapping

| Requirement | Example in `trips.html` |
| --- | --- |
| Interpolation | `{{ studentName }}`, `{{ trips.length }}` |
| Event binding | `@click="incrementClickCount"` |
| Prevent form reload | `@submit.prevent="addCustomTrip"` |
| Attribute binding | `:datetime`, `:aria-label`, `:disabled` |
| Class binding | `:class="{ completed: demoCompleted }"` |
| Two-way binding | `v-model.trim`, `v-model` on inputs and checkbox |
| Conditional rendering | `v-if`, `v-else`, and `v-show` |
| List rendering | `v-for="trip in filteredTrips"` |
| Computed property | `filteredTrips` and `upcomingCount` |
| Component and props | `<trip-summary :total="..." :upcoming="...">` |
| Custom directives | `v-uppercase`, `v-highlight`, `v-format-date` |

## How to run

Open `trips.html` directly in a modern browser. An internet connection is
required because Vue 3 is loaded from the official CDN:

```html
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
```
