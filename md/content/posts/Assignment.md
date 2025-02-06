---
title: Assignment
date: 2025-02-02
draft: false
tags:
---

# Your Task 
Write a php program
Use at least **three** of these
 - Functions
- While Loops
- For Loops
- Input/Output
- Arrays
- Conditionalsclass

# findirfin.dev/md/

# Previous Lessons 
go here to get reminders
https://drive.google.com/drive/u/0/folders/1H0BQTHqyWT_w3m2FBkvlybV-VRbYVGPt



# Examples



**1. Functions**

```php
<?php
function greet($name) {
  return "Hello, " . $name . "!";
}

echo greet("Alice"); // Output: Hello, Alice!
?>
```

**2. While Loops**

```php
<?php
$i = 1;
while ($i <= 5) {
  echo $i . " ";
  $i++;
}
// Output: 1 2 3 4 5
?>
```

**3. For Loops**

```php
<?php
for ($i = 1; $i <= 5; $i++) {
  echo $i . " ";
}
// Output: 1 2 3 4 5
?>
```

**4. Input/Output**

```php
<?php
// Output
echo "Enter your name: ";

// Input (from command line, requires running PHP from the terminal)
$name = readline();

echo "Hello, " . $name . "!";
?>
```

**5. Arrays**

```php
<?php
// Indexed array
$colors = array("red", "green", "blue");
echo $colors[0]; // Output: red

// Associative array
$ages = array("Peter" => 35, "Ben" => 37, "Joe" => 43);
echo $ages["Peter"]; // Output: 35
?>
```

**6. Conditionals**

```php
<?php
$age = 20;

if ($age >= 18) {
  echo "You are an adult.";
} else {
  echo "You are a minor.";
}
// Output: You are an adult.
?>
```

