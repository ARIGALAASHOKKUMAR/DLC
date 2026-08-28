import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Image,
  Linking,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { FieldArray, FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";

import { login } from "../actions";
import {
  BASICPROFILE,
  commonAPICall,
  DIGITALLABOURCHOWKDETAILS,
  GETDISTSAPP,
  GETMANDALSAPP,
  GETSKILLS,
  GETVILLAGESAPP,
} from "../utils/utils";
import { profileMenu } from "../utils/CommonFunctions";
import ImageBucketRN from "../utils/ImageBucketRN";
import OldProfileUpdate from "./OldProfileUpdate";

// Import all section components
import { BasicAndLocationDetails } from "../screens/ProfileUpdateScreens/BasicAndLocationDetails";
import { IdentityVerification } from "../screens/ProfileUpdateScreens/IdentityVerification";
import { SkillDetails } from "../screens/ProfileUpdateScreens/SkillDetails";
import { WorkExperience } from "../screens/ProfileUpdateScreens/WorkExperience";
import { Education } from "../screens/ProfileUpdateScreens/Education";
import { ChangePassword } from "../screens/ProfileUpdateScreens/ChangePassword";
import { EmployerWorkDetails } from "../screens/ProfileUpdateScreens/EmployerWorkDetails";
import { Help } from "../screens/ProfileUpdateScreens/Help";
import { styles } from "../screens/ProfileUpdateScreens/styles";

// Section title mapping for consistent translations
const SECTION_TITLES = {
  basic_details: "Basic Details / ప్రాథమిక వివరాలు",
  identity_verification: "Identity Verification / గుర్తింపు ధృవీకరణ",
  location_information: "Location Information / స్థాన సమాచారం",
  skill_details: "Skill Details / నైపుణ్య వివరాలు",
  work_experience: "Work Experience / పని అనుభవం",
  education: "Education / విద్య",
  change_password: "Change Password / పాస్వర్డ్ మార్చండి",
  work_details: "Work Details / పని వివరాలు",
  help: "Help / సహాయం",
};

// Components mapping for each section
const SECTION_COMPONENTS = {
  basic_details: BasicAndLocationDetails,
  identity_verification: IdentityVerification,
  location_information: BasicAndLocationDetails, // Now handled in BasicAndLocationDetails
  skill_details: SkillDetails,
  work_experience: WorkExperience,
  education: Education,
  change_password: ChangePassword,
  work_details: EmployerWorkDetails,
  help: Help,
};

// Role-based section filters
const ROLE_FILTERS = {
  "DLC Employer": (item) => 
    !["skill_details", "education", "work_experience"].includes(item.value),
  "DLC Worker": (item) => 
    item.value !== "work_details",
};

const ProfileUpdate = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const state = useSelector((state) => state.LoginReducer);
  const { isLoggedIn, roleName, roleId } = state;

  const [selectedSection, setSelectedSection] = useState(null);
  const [overalldata, setOveralldata] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigation.replace("Login");
    }
  }, [isLoggedIn, navigation]);

  // Fetch profile details
  const overalldetails = async () => {
    try {
      const res = await commonAPICall(
        DIGITALLABOURCHOWKDETAILS,
        {},
        "get",
        dispatch,
      );

      if (res?.status === 200) {
        setOveralldata(res?.data?.DigitalLabourChowkRegistration_Details || []);
      }
    } catch (error) {
      console.log("Error fetching profile details:", error);
    }
  };

  // Fetch data only for eligible roles
  useEffect(() => {
    if (roleName === "DLC Employer" || roleName === "DLC Worker") {
      overalldetails();
    }
  }, [refreshKey, roleName]);

  // Refresh profile data
  const handleRefreshProfile = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Get user data
  const userData = overalldata[0] || {};

  // Check if a section is completed based on its key
  const isCompleted = (key) => {
    if (!key) return false;

    const value = userData?.[key];

    // Handle array fields (education, work_history, skills)
    if (["education", "work_history", "skills"].includes(key)) {
      try {
        const parsed = JSON.parse(value || "[]");
        return Array.isArray(parsed) && parsed.length > 0;
      } catch (e) {
        return false;
      }
    }

    // Handle location info - check if all location fields are filled
    if (key === "location_info_completed") {
      return !!(
        userData?.district &&
        userData?.mandal &&
        userData?.village &&
        userData?.plot_or_house_number &&
        userData?.landmark &&
        userData?.pincode &&
        userData?.latitude &&
        userData?.longitude
      );
    }

    // Basic check for other fields
    return !!value;
  };

  // Get translated section title
  const getSectionTitle = (section) => {
    if (!section) return "My Profile / నా ప్రొఫైల్";
    return SECTION_TITLES[section] || section.replace(/_/g, " ").toUpperCase();
  };

  // Get menu title with translation
  const getMenuTitle = (item) => {
    return SECTION_TITLES[item.value] || item.title;
  };

  // Get filtered menu items based on role
  const getFilteredMenu = () => {
    const filter = ROLE_FILTERS[roleName] || (() => true);
    
    return profileMenu
      .filter((item) => {
        // Apply role-based filter
        if (!filter(item)) return false;
        return true;
      })
      .sort((a, b) => a.id - b.id);
  };

  // Render the selected section component
  const renderSelectedSection = () => {
    const Component = SECTION_COMPONENTS[selectedSection];
    if (!Component) return null;

    // For location_information, pass a flag to indicate it's a separate section
    const isLocationOnly = selectedSection === "location_information";

    return (
      <Component
        userData={userData}
        onUpdateSuccess={handleRefreshProfile}
        isLocationOnly={isLocationOnly}
      />
    );
  };

  // Render menu item with completion status
  const renderMenuItem = (item) => {
    const completed = isCompleted(item.key);
    const menuTitle = getMenuTitle(item);
    const isHelp = item.value === "help";

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.menuItem}
        onPress={() => setSelectedSection(item.value)}
        activeOpacity={0.8}
      >
        <View style={styles.menuLeft}>
          <Ionicons
            name={item.icon}
            size={22}
            color="#1e3a5f"
            style={styles.menuIcon}
          />
          <Text style={styles.menuTitle}>{menuTitle}</Text>
        </View>

        {!isHelp && (
          <View style={styles.statusContainer}>
            <Ionicons
              name={completed ? "checkmark-circle" : "close-circle"}
              size={16}
              color={completed ? "green" : "red"}
            />
            <Text style={[
              styles.statusText, 
              completed ? styles.completedText : styles.notCompletedText
            ]}>
              {completed ? "Completed" : "Pending"}
            </Text>
          </View>
        )}

        <Ionicons name="chevron-forward" size={22} color="#1e3a5f" />
      </TouchableOpacity>
    );
  };

  // If not logged in, don't render
  if (!isLoggedIn) return null;

  // For non-DLC roles, render old profile update
  if (roleName !== "DLC Employer" && roleName !== "DLC Worker") {
    return <OldProfileUpdate />;
  }

  const filteredMenu = getFilteredMenu();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>
          {selectedSection
            ? getSectionTitle(selectedSection)
            : "My Profile / నా ప్రొఫైల్"}
        </Text>

        <View style={styles.panel}>
          {!selectedSection ? (
            <View>
              {filteredMenu.map(renderMenuItem)}
            </View>
          ) : (
            <View>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setSelectedSection(null)}
              >
                <Ionicons name="arrow-back" size={20} color="#0d6efd" />
                <Text style={styles.backButtonText}>
                  Back to Profile Menu / ప్రొఫైల్ మెనూకి తిరిగి వెళ్ళు
                </Text>
              </TouchableOpacity>

              {renderSelectedSection()}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileUpdate;