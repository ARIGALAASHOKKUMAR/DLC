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
import { BasicDetails } from "../screens/ProfileUpdateScreens/BasicDetails";
import { IdentityVerification } from "../screens/ProfileUpdateScreens/IdentityVerification";
import { LocationInformation } from "../screens/ProfileUpdateScreens/LocationInformation";
import { SkillDetails } from "../screens/ProfileUpdateScreens/SkillDetails";
import { WorkExperience } from "../screens/ProfileUpdateScreens/WorkExperience";
import { Education } from "../screens/ProfileUpdateScreens/Education";
import { ChangePassword } from "../screens/ProfileUpdateScreens/ChangePassword";
import { EmployerWorkDetails } from "../screens/ProfileUpdateScreens/EmployerWorkDetails";
import { Help } from "../screens/ProfileUpdateScreens/Help";
import { styles } from "../screens/ProfileUpdateScreens/styles";

const ProfileUpdate = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const state = useSelector((state) => state.LoginReducer);
  const { isLoggedIn } = state;

  const [selectedSection, setSelectedSection] = useState(null);
  const [overalldata, setOveralldata] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) {
      navigation.replace("Login");
    }
  }, [isLoggedIn, navigation]);

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

  useEffect(() => {
    {(state.roleName == "DLC Employer" || state.roleName === "DLC Worker") && overalldetails()}
  }, [refreshKey]);

  const handleRefreshProfile = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const renderSelectedSection = () => {
    const userData = overalldata[0] || {};

    switch (selectedSection) {
      case "basic_details":
        return (
          <BasicDetails
            userData={userData}
            onUpdateSuccess={handleRefreshProfile}
          />
        );

      case "identity_verification":
        return (
          <IdentityVerification
            userData={userData}
            onUpdateSuccess={handleRefreshProfile}
          />
        );

      case "location_information":
        return (
          <LocationInformation
            userData={userData}
            onUpdateSuccess={handleRefreshProfile}
          />
        );

      case "skill_details":
        return (
          <SkillDetails
            userData={userData}
            onUpdateSuccess={handleRefreshProfile}
          />
        );

      case "work_experience":
        return (
          <WorkExperience
            userData={userData}
            onUpdateSuccess={handleRefreshProfile}
          />
        );

      case "education":
        return (
          <Education
            userData={userData}
            onUpdateSuccess={handleRefreshProfile}
          />
        );

      case "change_password":
        return (
          <ChangePassword
            userData={userData}
            onUpdateSuccess={handleRefreshProfile}
          />
        );

      case "work_details":
        return (
          <EmployerWorkDetails
            userData={userData}
            onUpdateSuccess={handleRefreshProfile}
          />
        );

      case "help":
        return <Help userData={userData} />;

      default:
        return null;
    }
  };

  if (!isLoggedIn) return null;

  const userData = overalldata[0] || {};

  const isCompleted = (key) => {
    if (!key) return false;

    const value = userData?.[key];

    console.log(`Checking completion for `, value);

    if (key === "education" || key === "work_history" || key === "skills") {
      try {
        const parsed = JSON.parse(value || "[]");
        return Array.isArray(parsed) && parsed.length > 0;
      } catch (e) {
        return false;
      }
    }

    return !!value;
  };

  // Helper function to translate section titles
  const getSectionTitle = (section) => {
    if (!section) return "My Profile / నా ప్రొఫైల్";

    const titles = {
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

    return (
      titles[section] ||
      section.replace(/_/g, " ").toUpperCase() +
        " / " +
        section.replace(/_/g, " ").toUpperCase()
    );
  };


  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {(state.roleId === 13 || state.roleName === "DLC Worker") && (
        <View style={styles.card}>
          <Text style={styles.header}>
            {selectedSection
              ? getSectionTitle(selectedSection)
              : "My Profile / నా ప్రొఫైల్"}
          </Text>

          <View style={styles.panel}>
            {!selectedSection ? (
              <View>
                {profileMenu
                  .filter((item) => {
                    if (state.roleName === "DLC Employer") {
                      return ![
                        "skill_details",
                        "education",
                        "work_experience",
                      ].includes(item.value);
                    } else if (state.roleName === "DLC Worker") {
                      return item.value !== "work_details";
                    }
                    return true;
                  })
                  .map((item) => {
                    const completed = isCompleted(item.key);
                    console.log("tessss", item);

                    // Translate menu titles
                    let menuTitle = item.title;
                    if (item.value === "basic_details")
                      menuTitle = "Basic Details / ప్రాథమిక వివరాలు";
                    else if (item.value === "identity_verification")
                      menuTitle = "Identity Verification / గుర్తింపు ధృవీకరణ";
                    else if (item.value === "location_information")
                      menuTitle = "Location Information / స్థాన సమాచారం";
                    else if (item.value === "skill_details")
                      menuTitle = "Skill Details / నైపుణ్య వివరాలు";
                    else if (item.value === "work_experience")
                      menuTitle = "Work Experience / పని అనుభవం";
                    else if (item.value === "education")
                      menuTitle = "Education / విద్య";
                    else if (item.value === "change_password")
                      menuTitle = "Change Password / పాస్వర్డ్ మార్చండి";
                    else if (item.value === "work_details")
                      menuTitle = "Work Details / పని వివరాలు";
                    else if (item.value === "help") menuTitle = "Help / సహాయం";

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

                        {item.value !== "help" && (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            {completed ? (
                              <Ionicons
                                name="checkmark-circle"
                                size={16}
                                color="green"
                              />
                            ) : (
                              <Ionicons
                                name="close-circle"
                                size={16}
                                color="red"
                              />
                            )}
                            {/* <Text>
                            {completed ? "Completed / పూర్తయింది" : "Not Completed / పూర్తి కాలేదు"}
                          </Text> */}
                          </View>
                        )}

                        <Ionicons
                          name="chevron-forward"
                          size={22}
                          color="#1e3a5f"
                        />
                      </TouchableOpacity>
                    );
                  })}
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
      )}
      {state.roleName !== "DLC Employer" && state.roleName !== "DLC Worker" && (
        <OldProfileUpdate />
      )}
    </ScrollView>
  );
};
export default ProfileUpdate;

