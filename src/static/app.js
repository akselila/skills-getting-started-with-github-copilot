document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // Participants section
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const participantsHeading = document.createElement("h5");
        participantsHeading.textContent = "Participants";
        participantsSection.appendChild(participantsHeading);

        const participantsList = document.createElement("ul");
        participantsList.className = "participants-list no-bullets";

        if (details.participants && details.participants.length > 0) {
          details.participants.forEach((participant) => {
            const li = document.createElement("li");
            li.className = "participant-item";
            // Participant name/email
            const span = document.createElement("span");
            span.textContent = participant;
            li.appendChild(span);

            // Delete icon
            const deleteIcon = document.createElement("span");
            deleteIcon.className = "delete-icon";
            deleteIcon.title = "Unregister participant";
            deleteIcon.innerHTML = "&#128465;"; // Trash can emoji
            deleteIcon.style.cursor = "pointer";
            deleteIcon.onclick = async () => {
              if (confirm(`Unregister ${participant} from ${name}?`)) {
                try {
                  const response = await fetch(`/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(participant)}`, {
                    method: "POST",
                  });
                  const result = await response.json();
                  if (response.ok) {
                    messageDiv.textContent = result.message || "Participant unregistered.";
                    messageDiv.className = "success";
                    fetchActivities();
                  } else {
                    messageDiv.textContent = result.detail || "Failed to unregister participant.";
                    messageDiv.className = "error";
                  }
                  messageDiv.classList.remove("hidden");
                  setTimeout(() => { messageDiv.classList.add("hidden"); }, 4000);
                } catch (error) {
                  messageDiv.textContent = "Error unregistering participant.";
                  messageDiv.className = "error";
                  messageDiv.classList.remove("hidden");
                }
              }
            };
            li.appendChild(deleteIcon);
            participantsList.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
          li.textContent = "No participants yet.";
          li.style.color = "#888";
          participantsList.appendChild(li);
        }

        participantsSection.appendChild(participantsList);
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities list so changes are shown immediately
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
