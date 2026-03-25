# HOWTO use

In any HTML form(s) that requires a properly formatted RRULE in a HTML Input (text) element - just add a property 'data-rrule-generator-form' to identify the element, then include the Javascript e.g.

```
<!-- Example blank -->
  <h1>form 1 - example blank</h1>
  <form id="my_form_1">
    <input type="text" id="input1" data-rrule-generator-form value=""><br>
    <input id="submite1" type="submit">
  </form>


<!-- Examples with pre-exsiting RRULEs to edit -->
  <h1>form 2 - pre-existing RRULE</h1>
  <form id="my_form_2">
    <input id="xyzABC" type="text" data-rrule-generator-form
      value="RRULE:FREQ=MONTHLY;COUNT=5;BYMONTHDAY=9,12,13"><br>
    <input id="submit2" type="submit">
  </form>

<script src="rrule_gui.js"></script>

// only need to include it once
// it will find all the elements it needs to change
```

## Acknowledgements

Forked from <https://github.com/superherogeek/rrule-generator-form>
