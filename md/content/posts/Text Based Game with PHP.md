---
title: Text Based Game with PHP
date: 2024-11-30
draft: false
tags:
  - coding
  - teaching
  - tutorial
---
>[!info]
>This is directed towards the Beginning Coding class
# Starter Code 
```php
<?php

// Show the initial question and form

echo "You are in a cave. Do you go west or east?<br>";

echo "<form method='post'>";

echo "<input type='text' name='direction' placeholder='Enter west or east'>";

echo "<input type='submit' value='Submit'>";

echo "</form>";

  

// Check if form is submitted

if ($_SERVER["REQUEST_METHOD"] == "POST") {

// Get the user's answer

$direction = $_POST['direction'];

  

// Decide what to say based on the direction

if ($direction == "west") {

echo "<p>You chose to go west.</p>";

  
  

// Additional question for going west

echo "Do you want to light a torch?<br>";

echo "<form method='post'>";

echo "<input type='hidden' name='direction' value='west'>";

echo "<input type='text' name='torch' placeholder='Enter yes or no'>";

echo "<input type='submit' value='Submit'>";

echo "</form>";

  

// Check if torch question is answered

if (isset($_POST['torch'])) {

$torch = $_POST['torch'];

if ($torch == "yes") {

echo "<p>You light a torch. The cave brightens up!</p>";

//add more options here

} elseif ($torch == "no") {

echo "<p>You decide against lighting a torch. It's dark ahead.</p>";

//add more options here

} else {

echo "<p>Please enter 'yes' or 'no' for the torch question.</p>";

}

}

  
  

} elseif ($direction == "east") {

echo "<p>You chose to go east.</p>";



//add more options here


} else {

echo "<p>Please enter 'west' or 'east'.</p>";

}

}

?>
```



# Code Explanation

### Initial Setup
- **Display Question and Form**: The script starts by displaying a scenario where the player is in a cave and must decide whether to go "west" or "east". It uses HTML to create a form where the user can input their choice.

```php
echo "You are in a cave. Do you go west or east?<br>";
echo "<form method='post'>";
echo "<input type='text' name='direction' placeholder='Enter west or east'>";
echo "<input type='submit' value='Submit'>";
echo "</form>";
```

### Handling User Input
- **Form Submission Check**: The script checks if the form has been submitted via POST method.

```php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $direction = $_POST['direction'];
    // Further logic based on $direction
}
```

### Decision Based on Direction
- **West Option**:
  - If the user chooses "west", it acknowledges the choice and then prompts another decision about lighting a torch. 
  - It uses another form to ask if the user wants to light a torch, with hidden input to remember the 'west' direction.

  ```php
  if ($direction == "west") {
      echo "<p>You chose to go west.</p>";
      echo "Do you want to light a torch?<br>";
      echo "<form method='post'>";
      echo "<input type='hidden' name='direction' value='west'>";
      echo "<input type='text' name='torch' placeholder='Enter yes or no'>";
      echo "<input type='submit' value='Submit'>";
      echo "</form>";

      // Handling torch decision
      if (isset($_POST['torch'])) {
          $torch = $_POST['torch'];
          if ($torch == "yes") {
              echo "<p>You light a torch. The cave brightens up!</p>";
          } elseif ($torch == "no") {
              echo "<p>You decide against lighting a torch. It's dark ahead.</p>";
          } else {
              echo "<p>Please enter 'yes' or 'no' for the torch question.</p>";
          }
      }
  }
  ```

- **East Option**: 
  - If the user chooses "east", it simply acknowledges the choice but doesn't provide further interaction yet (indicated by a comment suggesting to add more options).

  ```php
  elseif ($direction == "east") {
      echo "<p>You chose to go east.</p>";
      // Placeholder for future expansion
  }
  ```

- **Invalid Input**: If the user enters anything other than "west" or "east", it prompts them to enter a valid direction.

  ```php
  else {
      echo "<p>Please enter 'west' or 'east'.</p>";
  }
  ```


# How to Expand

1. **Add More Directions or Actions**:
   - After checking which direction the user chose, add more conditions or nested if-statements for additional actions or paths. For example, for going "east", you could add new questions or scenarios.

   ```php
   elseif ($direction == "east") {
       echo "<p>You chose to go east.</p>";
       echo "Do you want to explore the river or the forest?<br>";
       echo "<form method='post'>";
       echo "<input type='hidden' name='direction' value='east'>";
       echo "<input type='text' name='explore' placeholder='Enter river or forest'>";
       echo "<input type='submit' value='Submit'>";
       echo "</form>";
       // Handle 'explore' choice here
   }
   ```

2. **Implement Consequences or Outcomes**:
   - For each choice, decide what happens next. If "yes" to lighting a torch in the west scenario, describe what they see or encounter.

   ```php
   if ($torch == "yes") {
       echo "<p>You light a torch. You see a path leading to a secret door!</p>";
       // Add another form or next step here
   }
   ```

3. **Add More Interaction Levels**:
   - Use nested forms to create deeper levels of interaction. Each choice could lead to another question or scenario.

   ```php
   if (isset($_POST['explore'])) {
       $explore = $_POST['explore'];
       if ($explore == "river") {
           echo "<p>You approach the river...</p>";
           // New form or scenario here
       } elseif ($explore == "forest") {
           echo "<p>You enter the dense forest...</p>";
           // New form or scenario here
       }
   }
   ```

4. **Error Handling and User Guidance**:
   - Make sure to handle invalid inputs gracefully, providing clear instructions or feedback.

   ```php
   if ($explore != "river" && $explore != "forest") {
       echo "<p>Please enter 'river' or 'forest'.</p>";
   }
   ```

5. **Enhance User Experience**:
   - Add more descriptive text, or even include images or sounds if you expand to a full webpage.

You can also just start from scratch using this guide as inspiration. 
If you have any questions, or find errors in my code, send me a message 
Good Luck