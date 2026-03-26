## TODO

Test and fix the submit vars by testing in a real form

## HOWTO use

In any HTML form(s) that requires a properly formatted RRULE in a HTML Input (text) element - just add a property 'data-rrule-generator-form' to identify the element, then include the Javascript e.g.

```
  <!-- Example blank -->
  <h1>form 1 - example blank</h1>
  <form id="my_form_1" method="get">
    <input type="text" name="input1" data-rrule-generator-form value=""><br>
    <input id="submit1" type="submit">
  </form>


  <!-- Examples with pre-exsiting RRULEs to edit -->
  <h1>form 2 - pre-existing RRULE</h1>
  <form id="my_form_2" method="get">
    <input id="xyzABC" name="xyzABC" type="text" data-rrule-generator-form
      value="RRULE:FREQ=MONTHLY;COUNT=5;BYMONTHDAY=9,12,13"><br>
    <input id="submit2" type="submit">
  </form>


  <h1>form 3- pre-existing RRULE with odd RFC5545 use</h1>
  <form id="form1" method="get">
    <input type="text" data-rrule-generator-form id="xyz123" name="xyz123"
      value="RRULE:FREQ=MONTHLY;INTERVAL=1;COUNT=5;BYDAY=2WE"></input><br>
    <input type="text" id="xyz123456" name="xyz123456"
      value="This is something other than an RRULE"><br>
    <input id="submit3" type="submit">
  </form>

<script src="rrule_gui.js"></script>

/*
  You can find the bundled JavaScript in the dist/ folder
    in this repository.
  It only needs to be included once.
  It will find all the input elements.
*/
```

## Acknowledgements

Forked from <https://github.com/superherogeek/rrule-generator-form>
