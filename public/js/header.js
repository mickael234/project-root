document.addEventListener('DOMContentLoaded', function() {
    var dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'))
    var dropdownList = dropdownElementList.map(function (dropdownToggleEl) {
      return new bootstrap.Dropdown(dropdownToggleEl)
    })
  
    // Add click event listener to dropdown toggle
    document.querySelectorAll('.dropdown-toggle').forEach(function(element) {
      element.addEventListener('click', function(e) {
        e.preventDefault();
        var dropdown = bootstrap.Dropdown.getInstance(element);
        if (dropdown._menu.classList.contains('show')) {
          dropdown.hide();
        } else {
          dropdown.show();
        }
      });
    });
  });
  
  