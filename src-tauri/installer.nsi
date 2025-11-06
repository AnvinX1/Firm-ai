; FIRM AI Professional Installer
; NSIS Modern User Interface with Custom Branding

!include "MUI2.nsh"
!include "FileFunc.nsh"

; --------------------------------
; Modern UI Configuration
; --------------------------------

!define MUI_ICON "icons\icon.ico"
!define MUI_UNICON "icons\icon.ico"

; Custom branding colors (Red, Black, White theme)
!define MUI_BGCOLOR 0F0F0F
!define MUI_TEXTCOLOR FFFFFF

; Header image (professional banner at top)
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "icons\installer-header.bmp"
!define MUI_HEADERIMAGE_UNBITMAP "icons\installer-header.bmp"
!define MUI_HEADERIMAGE_RIGHT

; Welcome/Finish page images (sidebar)
!define MUI_WELCOMEFINISHPAGE_BITMAP "icons\installer-sidebar.bmp"
!define MUI_UNWELCOMEFINISHPAGE_BITMAP "icons\installer-sidebar.bmp"

; Abort warning
!define MUI_ABORTWARNING
!define MUI_ABORTWARNING_TEXT "Are you sure you want to quit FIRM AI Setup?"

; --------------------------------
; Welcome Page Configuration
; --------------------------------

!define MUI_WELCOMEPAGE_TITLE "Welcome to FIRM AI Setup"
!define MUI_WELCOMEPAGE_TEXT "This wizard will guide you through the installation of FIRM AI - the AI-powered law learning platform.$\r$\n$\r$\nFIRM AI helps law students master legal concepts through:$\r$\n$\r$\n  • AI-Powered Case Analysis (IRAC)$\r$\n  • Intelligent Mock Tests & Quizzes$\r$\n  • Personalized AI Legal Tutor$\r$\n  • Study Planning & Analytics$\r$\n$\r$\nClick Next to continue."

; --------------------------------
; Finish Page Configuration
; --------------------------------

!define MUI_FINISHPAGE_TITLE "FIRM AI Installation Complete"
!define MUI_FINISHPAGE_TEXT "FIRM AI has been successfully installed on your computer.$\r$\n$\r$\nYou can now launch the application and start your AI-powered legal learning journey.$\r$\n$\r$\nClick Finish to close this wizard."

!define MUI_FINISHPAGE_RUN "$INSTDIR\${MAINBINARYNAME}.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Launch FIRM AI"
!define MUI_FINISHPAGE_RUN_CHECKED

!define MUI_FINISHPAGE_LINK "Visit firmai.com for help and updates"
!define MUI_FINISHPAGE_LINK_LOCATION "https://firmai.com"

; --------------------------------
; License Page Configuration
; --------------------------------

!define MUI_LICENSEPAGE_TEXT_TOP "Please review the license agreement before installing FIRM AI."
!define MUI_LICENSEPAGE_TEXT_BOTTOM "If you accept the terms of the agreement, click I Agree to continue. You must accept the agreement to install FIRM AI."
!define MUI_LICENSEPAGE_BUTTON "I &Agree"

; --------------------------------
; Directory Page Configuration
; --------------------------------

!define MUI_DIRECTORYPAGE_TEXT_TOP "Setup will install FIRM AI in the following folder. To install in a different folder, click Browse and select another folder.$\r$\n$\r$\nClick Next to continue."
!define MUI_DIRECTORYPAGE_TEXT_DESTINATION "Installation Folder"

; --------------------------------
; Components Page Configuration
; --------------------------------

!define MUI_COMPONENTSPAGE_TEXT_TOP "Select the components you want to install and deselect the components you don't want to install. Click Next to continue."
!define MUI_COMPONENTSPAGE_TEXT_COMPLIST "Select components to install:"

; --------------------------------
; Installation Progress
; --------------------------------

!define MUI_INSTFILESPAGE_COLORS "DC2626 000000" ; Red on black theme
!define MUI_INSTFILESPAGE_PROGRESSBAR "colored"

; --------------------------------
; Pages
; --------------------------------

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; --------------------------------
; Languages
; --------------------------------

!insertmacro MUI_LANGUAGE "English"

; --------------------------------
; Branding
; --------------------------------

BrandingText "FIRM AI - AI-Powered Legal Learning"
Name "${PRODUCTNAME}"
OutFile "${OUTFILE}"
InstallDir "$LOCALAPPDATA\${PRODUCTNAME}"
InstallDirRegKey HKCU "Software\${PRODUCTNAME}" ""

; Request application privileges
RequestExecutionLevel user

; --------------------------------
; Version Information
; --------------------------------

VIProductVersion "${VERSION}.0"
VIAddVersionKey /LANG=${LANG_ENGLISH} "ProductName" "${PRODUCTNAME}"
VIAddVersionKey /LANG=${LANG_ENGLISH} "ProductVersion" "${VERSION}"
VIAddVersionKey /LANG=${LANG_ENGLISH} "CompanyName" "FIRM AI"
VIAddVersionKey /LANG=${LANG_ENGLISH} "LegalCopyright" "Copyright © 2024 FIRM AI"
VIAddVersionKey /LANG=${LANG_ENGLISH} "FileDescription" "FIRM AI - AI-Powered Law Learning Platform"
VIAddVersionKey /LANG=${LANG_ENGLISH} "FileVersion" "${VERSION}"
VIAddVersionKey /LANG=${LANG_ENGLISH} "Comments" "Intelligent legal education powered by AI"

; --------------------------------
; Installer Sections
; --------------------------------

Section "FIRM AI" SecMain
  SectionIn RO ; Read-only - must be installed
  
  SetOutPath "$INSTDIR"
  
  ; Add files
  File /r "${RESOURCESPATH}\*.*"
  
  ; Create shortcuts
  CreateDirectory "$SMPROGRAMS\${PRODUCTNAME}"
  CreateShortCut "$SMPROGRAMS\${PRODUCTNAME}\${PRODUCTNAME}.lnk" "$INSTDIR\${MAINBINARYNAME}.exe" "" "$INSTDIR\${MAINBINARYNAME}.exe" 0
  CreateShortCut "$SMPROGRAMS\${PRODUCTNAME}\Uninstall ${PRODUCTNAME}.lnk" "$INSTDIR\uninstall.exe" "" "$INSTDIR\uninstall.exe" 0
  
  CreateShortCut "$DESKTOP\${PRODUCTNAME}.lnk" "$INSTDIR\${MAINBINARYNAME}.exe" "" "$INSTDIR\${MAINBINARYNAME}.exe" 0
  
  ; Write registry keys
  WriteRegStr HKCU "Software\${PRODUCTNAME}" "" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCTNAME}" "DisplayName" "${PRODUCTNAME}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCTNAME}" "UninstallString" "$INSTDIR\uninstall.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCTNAME}" "DisplayIcon" "$INSTDIR\${MAINBINARYNAME}.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCTNAME}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCTNAME}" "Publisher" "FIRM AI"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCTNAME}" "URLInfoAbout" "https://firmai.com"
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCTNAME}" "NoModify" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCTNAME}" "NoRepair" 1
  
  ; Calculate installed size
  ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
  IntFmt $0 "0x%08X" $0
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCTNAME}" "EstimatedSize" "$0"
  
  ; Create uninstaller
  WriteUninstaller "$INSTDIR\uninstall.exe"
SectionEnd

; --------------------------------
; Section Descriptions
; --------------------------------

LangString DESC_SecMain ${LANG_ENGLISH} "Core application files and resources required to run FIRM AI."

!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
  !insertmacro MUI_DESCRIPTION_TEXT ${SecMain} $(DESC_SecMain)
!insertmacro MUI_FUNCTION_DESCRIPTION_END

; --------------------------------
; Uninstaller Section
; --------------------------------

Section "Uninstall"
  ; Remove files
  RMDir /r "$INSTDIR"
  
  ; Remove shortcuts
  RMDir /r "$SMPROGRAMS\${PRODUCTNAME}"
  Delete "$DESKTOP\${PRODUCTNAME}.lnk"
  
  ; Remove registry keys
  DeleteRegKey HKCU "Software\${PRODUCTNAME}"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCTNAME}"
SectionEnd

; --------------------------------
; Custom Functions
; --------------------------------

Function .onInit
  ; Display splash or custom initialization
  SetShellVarContext current
FunctionEnd

Function un.onInit
  MessageBox MB_YESNO "Are you sure you want to completely remove FIRM AI and all of its components?" IDYES +2
  Abort
FunctionEnd

Function .onInstSuccess
  ; Custom actions on successful installation
FunctionEnd

