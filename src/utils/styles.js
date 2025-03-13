export const getPriorityColor = (priority) => {
  switch (priority) {
    case "high":
      return "badge-danger";
    case "medium":
      return "badge-warning";
    case "low":
      return "badge-success";
    default:
      return "badge-secondary";
  }
}; 