import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#f5f6fa",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
  },
  header: {
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "left",
    backgroundColor: "#0d6efd",
    paddingVertical: 14,
    color: "white",
    padding: "14",
  },
  panel: {
    padding: 16,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    elevation: 1,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    flexShrink: 1,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  backButtonText: {
    fontSize: 15,
    color: "#0d6efd",
    fontWeight: "600",
    marginLeft: 6,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 16,
  },
  inputBlock: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: "#222",
  },
  requiredStar: {
    color: "red",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: "#000",
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginTop: 6,
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: "#198754",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    minHeight: 45,
    justifyContent: "center",
  },
  datePickerButtonText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    color: "#999",
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    flexWrap: "wrap",
  },
  radioColumn: {
    marginTop: 5,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    marginBottom: 8,
  },
  radioText: {
    marginLeft: 6,
    fontSize: 15,
    color: "#333",
  },
  
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#3856b5",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f0f4ff",
  },
  photoButtonText: {
    marginLeft: 8,
    color: "#3856b5",
    fontWeight: "600",
  },
  uploadButton: {
    backgroundColor: "#0d6efd",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  fileInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    padding: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
  },
  fileNameText: {
    flex: 1,
    marginLeft: 6,
    fontSize: 13,
    color: "#333",
  },
  removeFileButton: {
    padding: 4,
  },
  locationButton: {
    backgroundColor: "#0d6efd",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  locationButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  helpBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 12,
  },
  helpText: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 8,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  readOnlyInput: {
    backgroundColor: "#f5f5f5",
  },
  experienceCard: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  expTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc3545",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteBtnText: {
    color: "#fff",
    fontSize: 13,
    marginLeft: 4,
  },
  addMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0d6efd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addMoreBtnText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  skillItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },

  skillText: {
    fontSize: 14,
    color: "#333",
  },
  addButton: {
    backgroundColor: "#e6f0ff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  addButtonText: {
    color: "#1e3a5f",
    fontWeight: "700",
  },
  deleteButton: {
    backgroundColor: "#ffe5e5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: "#c53030",
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#1e3a5f",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  skillsSelectBoxNew: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 50,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
  },

  skillsSelectBoxOpenNew: {
    borderColor: "#1e3a5f",
  },

  skillsSelectedTextNew: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginRight: 10,
  },

  skillsDropdownBoxNew: {
    marginTop: 6,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  skillsDropdownItemNew: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    backgroundColor: "#fff",
  },

  skillsDropdownItemSelectedNew: {
    backgroundColor: "#f4f8ff",
  },

  skillsDropdownTextNew: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    marginRight: 10,
  },

  skillsDropdownTextSelectedNew: {
    color: "#1e3a5f",
    fontWeight: "600",
  },

  skillsDropdownLastItemNew: {
    borderBottomWidth: 0,
  },
  rowBetween: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  selectBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  picker: {
    color: "#000", // Force black text in all modes
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Modal content container
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  // Modal header with title and close button
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 10,
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a5f',
    flex: 1,
  },
  
  closeButton: {
    padding: 5,
  },
  
  // List container for skills
  modalList: {
    maxHeight: 400,
  },
  
  // Done button at bottom of modal
  doneButton: {
    backgroundColor: '#1e3a5f',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Container for main view
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  
  // Content container with padding
  contentContainer: {
    paddingBottom: 30,
    paddingHorizontal: 16,
  },
});
