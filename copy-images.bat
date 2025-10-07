@echo off
echo Copying images for all rental IDs...

REM Available source images
set "images=placeholder-3i9ie.png placeholder-wfxjf.png placeholder-dzif9.png placeholder-jq79d.png placeholder-ktvrm.png placeholder-7iqyy.png placeholder-58a2z.png placeholder-w7bc6.png placeholder-wrzzb.png cozy-studio-apartment.png modern-studio-apartment.png rental-property.png"

REM Copy images for ID 1-10
for /L %%i in (1,1,10) do (
    echo Copying images for ID %%i...
    
    REM Parking images (2 images)
    copy placeholder-3i9ie.png rental-images\%%i\parking\parking-1.jpg > nul 2>&1
    copy placeholder-wfxjf.png rental-images\%%i\parking\parking-2.jpg > nul 2>&1
    
    REM 360 view (1 image)
    copy rental-property.png rental-images\%%i\360-view\360-view-1.jpg > nul 2>&1
    
    REM Room photos (3 images)
    copy cozy-studio-apartment.png rental-images\%%i\rooms\room-1.jpg > nul 2>&1
    copy modern-studio-apartment.png rental-images\%%i\rooms\room-2.jpg > nul 2>&1
    copy placeholder-dzif9.png rental-images\%%i\rooms\room-3.jpg > nul 2>&1
    
    REM Entrance (1 image)
    copy placeholder-jq79d.png rental-images\%%i\entrance\entrance-1.jpg > nul 2>&1
)

echo Done! All images copied successfully.