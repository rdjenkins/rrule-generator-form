# HOWTO use

In any HTML form(s) that requires an RRULE in a HTML Input (text) element - just add a property 'data-rrule-generator-form' to identify the element, then include the Javascript e.g.

```
// Example blank
<form id="my_form_1">
<input type="text" data-rrule-generator-form value="">
<input type="submit">
</form>

// Example with pre-exsiting RRULE to edit
<form id="my_form_2">
<input type="text" data-rrule-generator-form value="RRULE:FREQ=MONTHLY;COUNT=5;BYMONTHDAY=9,12,13">
<input type="submit">
</form>

<script src="rrule_gui.js"></script> // only need to include it once, it will find all the elements it needs to change
```

## Acknowledgements

Forked from <https://github.com/superherogeek/rrule-generator-form>
