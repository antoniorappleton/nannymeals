 # TODO - Perfil Screen Updates

## Task: Verify profile screen functionalities and remove duplicate buttons

### Issues Found:
1. JavaScript references `btn-new-plan` but the button doesn't exist in HTML (orphan code)
2. "Preferências" button exists and user wants it removed
3. Delete plan functionality verified - working correctly

### Changes Required:
- [x] Remove orphan `btn-new-plan` JavaScript reference
- [x] Remove "Preferências" button from profile screen
- [x] Verify delete plan functionality works correctly

### File Edited:
- app/public/perfil.html

### Summary:
- Removed the orphan JavaScript code `document.getElementById("btn-new-plan").onclick` that was referencing a non-existent button element
- Removed the "Preferências" button from the bottom action section (the one that was doing the same as "Criar Plano")
- The delete plan functionality is already working properly:
  - Shows active plans with delete button
  - Has confirmation modal
  - Properly deletes from Firestore using `deletePlan` function

