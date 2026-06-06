// educationContent.js — Patient education content
// 10 profiles × 3 languages × 7 tabs
// Tabs: 0=What is it, 1=Treatment, 2=Warning Signs, 3=Ask Doctor, 4=Side Effects, 5=Diet, 6=Mental Health

export const TAB_ICONS = ['🧠', '💊', '⚠️', '❓', '🩺', '🥗', '💙'];

export const TAB_LABELS = {
  en: ['What is it?', 'Treatment', 'Warning Signs', 'Ask Doctor', 'Side Effects', 'Diet & Nutrition', 'Mental Health'],
  si: ['කුමක්ද?', 'ප්‍රතිකාරය', 'අනතුරු ලකුණු', 'වෛද්‍ය ප්‍රශ්න', 'බලපෑම්', 'ආහාර', 'මානසික සෞඛ්‍යය'],
  ta: ['என்ன?', 'சிகிச்சை', 'எச்சரிக்கை', 'மருத்துவர்', 'விளைவுகள்', 'உணவு', 'மன நலம்']
};

export const PROFILES = {

  // ── GLIOMA GRADE I ──────────────────────────────────────────────
  glioma_1: {
    meta: {
      name: { en: 'Glioma Grade I', si: 'ග්ලියෝමා - ශ්‍රේණිය 1', ta: 'க்ளியோமா - தரம் 1' },
      accent: '#2563eb', accentBg: '#eff6ff', icon: 'G1'
    },
    en: [
      `You have a type of brain growth called 
Glioma. It is Grade 1 — this is the 
mildest and slowest growing type.

Think of it like a very slow growing 
seed in your brain. It is not fast 
moving and many people with Grade 1 
live full normal lives.

Your doctor found this early and has 
a plan to take care of you. You are 
in good hands.`,
      `For Grade 1 Glioma, the most common 
treatment is surgery to gently remove 
the growth.

Most people with Grade 1 do NOT need 
chemotherapy or radiation right away.

Your doctor will watch you carefully 
with regular brain scans. This is 
called monitoring — it means your 
doctor is always keeping an eye on you.

Always take any medicines your doctor 
gives you and attend all your 
appointments.`,
      `🔴 GO TO HOSPITAL RIGHT NOW IF:
- Your body starts shaking or jerking
- You suddenly cannot speak
- One side of your body feels weak
- You faint or lose consciousness
- Very sudden and severe headache

🟡 CALL YOUR DOCTOR TODAY IF:
- Headache getting worse every day
- You vomit more than twice
- Your vision is getting blurry
- You feel very confused

🟢 THIS IS NORMAL — DON'T WORRY:
- Feeling a little tired
- Mild headache now and then
- Feeling emotional sometimes`,
      `Here are good questions to ask 
your doctor at your next visit:

- Where exactly is my tumor?
- How often will I need brain scans?
- What activities are safe for me?
- Can I drive and go to work?
- What should make me call you?
- Will it grow back after treatment?
- Who do I call if I feel worried?`,
      `If you have surgery you may feel:

😴 Tired — this is very normal
   Your brain needs rest to heal.
   Sleep when you feel tired.

🤕 Headache after surgery
   This gets better day by day.
   Your doctor will give you medicine.

😟 Feeling emotional or sad
   This is completely normal.
   Talk to your family and care team.

💇 Some hair may be shaved for surgery
   It will grow back.

Remember — these are signs your 
body is healing. They will get better!`,
      `Eating well helps your brain heal 
and keeps you strong.

✅ Good foods to eat:
- Rice, bread, roti — gives energy
- Fish, eggs, dhal — builds strength
- Fruits and vegetables — helps healing
- Drink plenty of water every day

❌ Try to avoid:
- Very spicy or oily food
- Too much sugar
- Alcohol

🥤 If you feel sick or have no hunger:
- Eat small amounts many times a day
- Try soft foods like porridge or soup
- Sip water or coconut water often

Ask your doctor if you need a 
special diet plan.`,
      `It is completely okay to feel scared, 
sad, or worried after your diagnosis.

These feelings are normal and many 
people feel the same way.

💙 Things that can help:
- Talk to someone you trust
- Spend time with family
- Do things you enjoy
- Rest when you feel tired
- Pray or meditate if it helps you

🗣️ Please talk to your doctor or 
nurse if you feel:
- Very sad for many days
- Afraid to be alone
- Unable to sleep
- Hopeless or overwhelmed

You are not alone. Your care team 
is here for you every step of the way.`
    ],
    si: [
      `ඔබේ මොළයේ "ග්ලියෝමා" නම් වර්ධනයක් 
ඇති බව වෛද්‍යවරයා සොයාගෙන ඇත.
ශ්‍රේණිය 1 — මෙය ඉතාම මන්දගාමීව 
වර්ධනය වන මෘදු වර්ගයයි.

මෙය ඔබේ මොළයේ ඉතා සෙමින් වැඩෙන 
කුඩා බීජයක් ලෙස සිතන්න. එය ඉක්මනින් 
පැතිරෙන්නේ නැත.

ශ්‍රේණිය 1 සහිත බොහෝ අය සාමාන්‍ය 
සතුටුදායක ජීවිතයක් ගත කරති.

ඔබේ වෛද්‍යවරයා මෙය කලින් සොයාගෙන 
ඔබ රැකගැනීමට සැලැස්මක් සකස් කර ඇත.
ඔබ ආරක්ෂිත අතේ සිටී.`,
      `ශ්‍රේණිය 1 ග්ලියෝමාට සාමාන්‍ය ප්‍රතිකාරය 
වන්නේ ශල්‍යකර්මයකි — එනම් වෛද්‍යවරයා 
ඔබේ මොළයෙන් ඒ කුඩා වර්ධනය ඉවත් 
කිරීමයි.

බොහෝ ශ්‍රේණිය 1 රෝගීන්ට රසායනික 
ප්‍රතිකාර හෝ විකිරණ ප්‍රතිකාර 
අවශ්‍ය නොවේ.

ඔබේ වෛද්‍යවරයා නිතරම MRI පරීක්ෂා 
මගින් ඔබව නිරීක්ෂණය කරනු ඇත.
මෙය ඔබව සැමවිට නිරීක්ෂණය 
කිරීම යන්නයි.

වෛද්‍යවරයා දෙන ඖෂධ නිතරම ගන්න.
සියලු හමුවීම් වලට පැමිණෙන්න.`,
      `🔴 දැන්ම රෝහලට යන්න මේ ලකුණු 
   ඇත්නම්:
- ශරීරය කම්පා වීම හෝ ඇඳ වැටීම
- හදිසියේ කතා කිරීමට නොහැකි වීම
- ශරීරයේ එක් පැත්තක් දුර්වල වීම
- දෑස් අදිනවා හෝ ඥානය නැතිවීම
- හදිසි දරුණු හිසරදය

🟡 අද වෛද්‍යවරයාට කතා කරන්න:
- දිනෙන් දින නරක් වන හිසරදය
- දෙවතාවකට වඩා වමනය
- දෑස් අපැහැදිලි වීම
- ව්‍යාකූලතාවය හෝ අමතක වීම

🟢 සාමාන්‍ය දේවල් — බය නොවන්න:
- සුළු තෙහෙට්ටුව
- සාමාන්‍ය මෘදු හිසරදය
- සමහර විට චිත්තවේගීය වීම`,
      `(වෛද්‍යවරයාගෙන් අහන්න)
ඔබේ ඊළඟ හමුවේදී මේ ප්‍රශ්න 
අහන්න:

- මගේ වර්ධනය හරියටම කොහේද?
- MRI පරීක්ෂා කොපමණ කාලයකට 
  වරක් කළ යුතුද?
- මට කළ හැකි ක්‍රියාකාරකම් 
  මොනවාද?
- රිය පැදවිය හැකිද? රැකියාවට 
  යා හැකිද?
- කුමන ලකුණු ඇති විට ඔබට 
  කතා කළ යුතුද?
- ප්‍රතිකාරයෙන් පසු නැවත 
  වර්ධනය වේද?
- කනස්සල්ලක් ඇත්නම් කාට 
  කතා කළ යුතුද?`,
      `(ඇතිවිය හැකි බලපෑම්)
ශල්‍යකර්මයෙන් පසු ඔබට 
මේවා දැනිය හැක:

😴 තෙහෙට්ටුව — ඉතාම සාමාන්‍යයි
   ඔබේ මොළයට සුවය ලැබීමට 
   විවේකය අවශ්‍යයි.
   තෙහෙට්ටුව දැනෙනවිට නිදා ගන්න.

🤕 ශල්‍යකර්මයෙන් පසු හිසරදය
   දිනෙන් දින හොඳ වේ.
   වෛද්‍යවරයා ඖෂධ දෙනු ඇත.

😟 චිත්තවේගීය හෝ දුකක් දැනීම
   මෙය සම්පූර්ණයෙන්ම සාමාන්‍යයි.
   ඔබේ පවුලට සහ රැකවරණ 
   කණ්ඩායමට කතා කරන්න.

💇 ශල්‍යකර්මය සඳහා හිස කෙස් 
   කපනු ලැබිය හැක.
   එය නැවත වැඩෙනු ඇත.

මතක තබා ගන්න — මේවා ඔබේ 
ශරීරය සුව වන ලකුණු!
ඒවා ටික කලකින් හොඳ වේ!`,
      `(ආහාර හා පෝෂණය)
හොඳ ආහාර ගැනීම ඔබේ මොළය 
සුව කිරීමට සහ ශක්තිය රැකගැනීමට 
උපකාරී වේ.

✅ හොඳ ආහාර:
- බත්, පාන්, රොටී — ශක්තිය ලබාදේ
- මාළු, බිත්තර, පරිප්පු — ශක්තිය 
  ගොඩනඟයි
- පලතුරු සහ එළවළු — සුව කිරීමට 
  උදව් කරයි
- දිනකට ජලය ප්‍රමාණවත් ලෙස 
  පානය කරන්න

❌ වළකින්න:
- ඉතාම매운 හෝ තෙල් සහිත ආහාර
- අධික සීනි
- මත්පැන්

🥤 ඔක්කාරය හෝ කුසගිනි නැත්නම්:
- දිනකට කිහිප වතාවක් කුඩා 
  ආහාර ගන්න
- කැඳ හෝ සුප් වැනි මෘදු ආහාර 
  උත්සාහ කරන්න
- ජලය හෝ කිතුල් ජලය සිප් කරන්න

විශේෂ ආහාර සැලැස්මක් 
අවශ්‍ය නම් වෛද්‍යවරයාගෙන් 
විමසන්න.`,
      `(මානසික සෞඛ්‍යය)
රෝග විනිශ්චයෙන් පසු බිය, දුක 
හෝ කනස්සල්ල දැනීම සම්පූර්ණයෙන්ම 
සාමාන්‍යයි.

මෙම හැඟීම් ස්වාභාවිකයි — 
බොහෝ අය ඒ ආකාරයෙන්ම 
දැනෙනවා.

💙 උදව් කළ හැකි දේ:
- විශ්වාස කරන කෙනෙකුට 
  කතා කරන්න
- පවුල සමඟ කාලය ගත කරන්න
- ඔබ කැමති දේ කරන්න
- තෙහෙට්ටුව දැනෙනවිට විවේකය ගන්න
- යාඥාව හෝ භාවනාව කරන්න

🗣️ ඔබට මේවා දැනෙනවා නම් 
වෛද්‍යවරයාට හෝ හෙදිනියට 
කියන්න:
- දිගු කාලයක් ඉතා දුකක් දැනීම
- තනිව සිටීමට බය
- නිදා ගත නොහැකි වීම
- බලාපොරොත්තු රහිත හැඟීම

ඔබ තනිව නොසිටී.
ඔබේ රැකවරණ කණ්ඩායම 
සෑම පියවරකදීම ඔබ සමඟ සිටී.`
    ],
    ta: [
      `உங்கள் மூளையில் "க்ளியோமா" என்ற 
வளர்ச்சி இருப்பதை உங்கள் மருத்துவர் 
கண்டுபிடித்துள்ளார்.
தரம் 1 — இது மிகவும் மெதுவாக 
வளரும் மிகவும் மென்மையான வகை.

இதை உங்கள் மூளையில் மிகவும் 
மெதுவாக வளரும் ஒரு சிறிய 
விதை என்று நினையுங்கள்.
இது வேகமாக பரவுவதில்லை.

தரம் 1 உள்ள பலர் இயல்பான 
மகிழ்ச்சியான வாழ்க்கை வாழ்கிறார்கள்.

உங்கள் மருத்துவர் இதை முன்கூட்டியே 
கண்டுபிடித்து உங்களை கவனிக்க 
திட்டம் தயார் செய்துள்ளார்.
நீங்கள் நல்ல கைகளில் இருக்கிறீர்கள்.`,
      `தரம் 1 க்ளியோமாவுக்கு பொதுவான 
சிகிச்சை அறுவை சிகிச்சை ஆகும் —
மருத்துவர் அந்த சிறிய வளர்ச்சியை 
உங்கள் மூளையிலிருந்து அகற்றுவார்.

பெரும்பாலான தரம் 1 நோயாளிகளுக்கு 
கீமோதெரபி அல்லது கதிர்வீச்சு 
சிகிச்சை உடனடியாக தேவையில்லை.

உங்கள் மருத்துவர் தொடர்ந்து 
MRI பரிசோதனைகள் மூலம் 
உங்களை கண்காணிப்பார்.
இது உங்களை எப்போதும் 
கவனித்துக்கொள்வதாகும்.

மருத்துவர் தரும் மருந்துகளை 
தவறாமல் எடுங்கள்.
அனைத்து சந்திப்புகளுக்கும் வாருங்கள்.`,
      `🔴 இந்த அறிகுறிகள் இருந்தால் 
   இப்போதே மருத்துவமனைக்கு செல்லுங்கள்:
- உடல் நடுங்குதல் அல்லது வலிப்பு
- திடீரென்று பேச முடியாமல் போவது
- உடலின் ஒரு பக்கம் பலவீனமாவது
- மயக்கம் அல்லது நனவு இழப்பு
- திடீர் கடுமையான தலைவலி

🟡 இன்றே மருத்துவரை அழையுங்கள்:
- தினமும் மோசமாகும் தலைவலி
- இரண்டு முறைக்கும் மேல் வாந்தி
- பார்வை மங்கலாவது
- குழப்பம் அல்லது மறதி

🟢 இயல்பானவை — பயப்பட வேண்டாம்:
- சிறிது சோர்வு
- அவ்வப்போது மிதமான தலைவலி
- சில நேரங்களில் உணர்ச்சிவசப்படுவது`,
      `உங்கள் அடுத்த சந்திப்பில் 
இந்த கேள்விகளை கேளுங்கள்:

- என் கட்டி சரியாக எங்கே உள்ளது?
- எத்தனை காலத்திற்கு ஒரு முறை 
  MRI பரிசோதனை செய்ய வேண்டும்?
- நான் என்ன செயல்களை செய்யலாம்?
- வாகனம் ஓட்டலாமா? வேலைக்கு 
  போகலாமா?
- எந்த அறிகுறிகளில் உங்களை 
  அழைக்க வேண்டும்?
- சிகிச்சைக்கு பிறகு மீண்டும் 
  வளருமா?
- கவலையாக இருந்தால் யாரை 
  தொடர்பு கொள்வது?`,
      `அறுவை சிகிச்சைக்கு பிறகு 
இவை உணரலாம்:

😴 சோர்வு — இது மிகவும் இயல்பானது
   உங்கள் மூளைக்கு குணமடைய 
   ஓய்வு தேவை.
   சோர்வாக இருக்கும்போது தூங்குங்கள்.

🤕 அறுவை சிகிச்சைக்கு பிறகு தலைவலி
   நாளுக்கு நாள் குணமாகும்.
   மருத்துவர் மருந்து தருவார்.

😟 உணர்ச்சிவசப்படுவது அல்லது 
   சோகமாக உணர்வது
   இது முற்றிலும் இயல்பானது.
   உங்கள் குடும்பத்தினரிடமும் 
   பராமரிப்பு குழுவிடமும் பேசுங்கள்.

💇 அறுவை சிகிச்சைக்காக தலை 
   முடி சிறிது கத்தரிக்கப்படலாம்.
   அது மீண்டும் வளரும்.

நினைவில் வையுங்கள் — இவை 
உங்கள் உடல் குணமடையும் அறிகுறிகள்!
சிறிது நேரத்தில் சரியாகிவிடும்!`,
      `நல்ல உணவு உங்கள் மூளை குணமடைய 
உதவுகிறது மற்றும் உங்களை 
வலிமையாக வைத்திருக்கிறது.

✅ நல்ல உணவுகள்:
- சோறு, ரொட்டி, சப்பாத்தி — 
  ஆற்றல் தருகிறது
- மீன், முட்டை, பருப்பு — 
  வலிமை கொடுக்கிறது
- பழங்கள் மற்றும் காய்கறிகள் — 
  குணமடைய உதவுகிறது
- தினமும் போதுமான தண்ணீர் குடியுங்கள்

❌ தவிர்க்க வேண்டியவை:
- மிகவும் காரமான அல்லது 
  எண்ணெய் உணவுகள்
- அதிக சர்க்கரை
- மது

🥤 குமட்டல் அல்லது பசியின்மை இருந்தால்:
- ஒரு நாளில் பலமுறை சிறிய 
  அளவில் சாப்பிடுங்கள்
- கஞ்சி அல்லது சூப் போன்ற 
  மென்மையான உணவுகளை முயற்சிக்கவும்
- தண்ணீர் அல்லது இளநீர் குடியுங்கள்

சிறப்பு உணவு திட்டம் தேவையெனில் 
மருத்துவரிடம் கேளுங்கள்.`,
      `நோய் கண்டறிந்த பிறகு பயம்,`
    ]
  },

  // ── GLIOMA GRADE II ──────────────────────────────────────────────
  glioma_2: {
    meta: {
      name: { en: 'Glioma Grade II', si: 'ග්ලියෝමා - ශ්‍රේණිය 2', ta: 'க்ளியோமா - தரம் 2' },
      accent: '#1d4ed8', accentBg: '#eff6ff', icon: 'G2'
    },
    en: [
      `You have a type of brain growth called 
Glioma. It is Grade 2 — this means it 
grows slowly but needs careful attention.

Grade 2 is still a low grade tumor. 
Many people with Grade 2 Glioma live 
for many years with proper treatment 
and monitoring.

Your doctor found this and has a 
treatment plan ready for you. 
You are not alone in this journey.`,
      `For Grade 2 Glioma treatment may include:

🔪 SURGERY
Your doctor may remove as much of 
the growth as safely possible.
This is the most common first step.

☢️ RADIATION THERAPY
After surgery your doctor may suggest 
radiation treatment to make sure 
no cells are left behind.
This is given over several weeks.

💊 CHEMOTHERAPY
Temozolomide tablets may be given 
to help stop the growth from 
coming back.

Your doctor will decide the best 
combination for your specific situation.
Always follow your doctor's advice.`,
      `🔴 GO TO HOSPITAL RIGHT NOW IF:
- Your body starts shaking or jerking
- Sudden severe headache
- Cannot speak suddenly
- One side of body goes weak
- You faint or lose consciousness
- Cannot see properly suddenly

🟡 CALL YOUR DOCTOR TODAY IF:
- Headache getting worse every day
- Vomiting more than twice
- Feeling very confused or forgetful
- Vision becoming blurry
- Fever above 38.5°C
- Feeling much worse than usual

🟢 THIS IS NORMAL — DON'T WORRY:
- Feeling tired during treatment
- Mild nausea
- Hair thinning
- Feeling emotional sometimes`,
      `Good questions to ask your doctor:

- Do I need surgery now or later?
- What are the risks of surgery?
- How many radiation sessions needed?
- How long will chemotherapy last?
- What side effects should I expect?
- When is my next MRI scan?
- Can I work during treatment?
- What activities should I avoid?
- Who do I call if I feel unwell?
- Will it grow back after treatment?`,
      `Treatment may cause some side effects. 
These are signs your body is fighting 
and healing. They are manageable!

😴 TIREDNESS
Very common during treatment.
Rest when you need to.
Short walks can actually help.

🤢 NAUSEA
Eat small meals often.
Avoid strong smells.
Your doctor can give medicine for this.

💇 HAIR THINNING OR LOSS
This is temporary.
Your hair will grow back after treatment.

🧠 MEMORY OR THINKING CHANGES
You may feel foggy sometimes.
This is normal and usually improves.
Tell your doctor if it bothers you.

🦴 BONE OR HIP PAIN AFTER CHEMO
This is a known side effect.
Tell your doctor — they can help.

Remember — your care team is 
always there to help manage 
these side effects!`,
      `Good nutrition helps your body 
cope with treatment and heal faster.

✅ GOOD FOODS TO EAT:
- Rice, bread, roti — gives energy
- Fish, eggs, chicken, dhal — 
  builds strength
- Fruits and vegetables — 
  boosts immunity
- Drink at least 8 glasses of 
  water daily

❌ TRY TO AVOID:
- Very spicy or greasy food
- Too much sugar and sweets
- Alcohol completely
- Raw or unwashed foods during 
  chemotherapy

🥤 IF YOU HAVE NO APPETITE:
- Eat small amounts 5-6 times a day
- Try soft foods like porridge, 
  soup, or curd rice
- Sip water or coconut water often
- Protein shakes can help if 
  you cannot eat much

Ask your doctor to refer you 
to a dietitian for a personal 
nutrition plan.`,
      `Receiving a Grade 2 diagnosis can 
feel overwhelming. Your feelings 
are completely valid.

It is okay to feel:
- Scared or anxious
- Sad or angry
- Confused or uncertain
- Worried about your family

💙 THINGS THAT CAN HELP:
- Talk openly with family or 
  a trusted friend
- Join a cancer support group
- Do gentle activities you enjoy
- Rest when your body needs it
- Pray or meditate if it helps

🗣️ PLEASE TELL YOUR DOCTOR IF:
- You feel very sad for many days
- You cannot sleep
- You feel hopeless or worthless
- You are afraid to be alone
- You have lost interest in everything

Your mental health is just as 
important as your physical health.
Your care team is here for you 
completely — body and mind.
You are stronger than you think. 💙`
    ],
    si: [
      `ඔබේ මොළයේ "ග්ලියෝමා" නම් 
වර්ධනයක් ඇති බව සොයාගෙන ඇත.
ශ්‍රේණිය 2 — මෙය සෙමින් වැඩෙන 
නමුත් ප්‍රවේශමෙන් අවධානය 
යොමු කළ යුතු වර්ගයකි.

ශ්‍රේණිය 2 තවමත් අඩු ශ්‍රේණියේ 
ගෙඩියකි. නිසි ප්‍රතිකාර සහ 
නිරීක්ෂණය සමඟ ශ්‍රේණිය 2 
ග්ලියෝමා සහිත බොහෝ අය 
බොහෝ අවුරුදු ජීවත් වෙති.

ඔබේ වෛද්‍යවරයා මෙය සොයාගෙන 
ඔබ සඳහා ප්‍රතිකාර සැලැස්මක් 
සකස් කර ඇත.
මෙම ගමනේදී ඔබ තනිව නොසිටී.`,
      `ශ්‍රේණිය 2 ග්ලියෝමාට 
ප්‍රතිකාරයට ඇතුළත් විය හැකි:

🔪 ශල්‍යකර්මය
ඔබේ වෛද්‍යවරයා ආරක්ෂිතව 
හැකිතාක් වර්ධනය ඉවත් කරනු ඇත.
මෙය බොහෝ විට පළමු පියවරයි.

☢️ විකිරණ ප්‍රතිකාරය
ශල්‍යකර්මයෙන් පසු කිසිදු 
සෛලයක් ඉතිරි නොවීමට 
විකිරණ ප්‍රතිකාර යෝජනා 
කළ හැක. සති කිහිපයක් 
පුරා දෙනු ලැබේ.

💊 රසායනික ප්‍රතිකාරය
ටෙමොසොලොමයිඩ් ටැබ්ලට් 
නැවත වර්ධනය නොවීමට 
දෙනු ලැබිය හැක.

ඔබේ විශේෂිත තත්වය සඳහා 
හොඳම සංයෝජනය ඔබේ 
වෛද්‍යවරයා තීරණය කරනු ඇත.
සෑම විටම ඔබේ වෛද්‍යවරයාගේ 
උපදෙස් අනුගමනය කරන්න.`,
      `🔴 දැන්ම රෝහලට යන්න:
- ශරීරය කම්පා වීම හෝ ඇදවැටීම
- හදිසි දරුණු හිසරදය
- හදිසියේ කතා කිරීමට නොහැකි වීම
- ශරීරයේ එක් පැත්තක් දුර්වල වීම
- ඥානය නැතිවීම
- හදිසියේ දෑස් නොපෙනීම

🟡 අද වෛද්‍යවරයාට කතා කරන්න:
- දිනෙන් දින නරක් වන හිසරදය
- දෙවතාවකට වඩා වමනය
- ඉතා ව්‍යාකූලතාවය හෝ අමතක වීම
- දෑස් අපැහැදිලි වීම
- 38.5°C ට වඩා උෂ්ණත්වය
- සාමාන්‍යයට වඩා ඉතා නරක් දැනීම

🟢 සාමාන්‍ය දේවල් — බය නොවන්න:
- ප්‍රතිකාර අතරතුර තෙහෙට්ටුව
- මෘදු ඔක්කාරය
- හිස කෙස් තුනී වීම
- සමහර විට චිත්තවේගීය වීම`,
      `ඔබේ ඊළඟ හමුවේදී මේ 
ප්‍රශ්න අහන්න:

- ශල්‍යකර්මය දැන් අවශ්‍යද 
  නැතිද?
- ශල්‍යකර්මයේ අවදානම් 
  මොනවාද?
- විකිරණ සැසි කීයක් අවශ්‍යද?
- රසායනික ප්‍රතිකාරය කොපමණ 
  කාලයක් පවතිනවාද?
- කුමන අතුරු ආබාධ 
  අපේක්ෂා කළ යුතුද?
- මගේ ඊළඟ MRI කවදාද?
- ප්‍රතිකාර අතරතුර රැකියාව 
  කළ හැකිද?
- කුමන ක්‍රියාකාරකම් 
  වළකින්න ඕනේද?`,
      `ප්‍රතිකාරය සමහර අතුරු 
ආබාධ ඇති කළ හැක.
මේවා ඔබේ ශරීරය සටන් 
කරන සහ සුව වන ලකුණු!

😴 තෙහෙට්ටුව
ප්‍රතිකාර අතරතුර ඉතාම සාමාන්‍යයි.
අවශ්‍ය විට විවේකය ගන්න.
කෙටි ඇවිදීම ඇත්තටම 
උදව් කළ හැක.

🤢 ඔක්කාරය
කෙටි ආහාර නිතර ගන්න.
තද සුවඳ වළකින්න.
ඔබේ වෛද්‍යවරයාට 
ඖෂධ දිය හැක.

💇 හිස කෙස් තුනී වීම හෝ 
   හැලීම
මෙය තාවකාලිකයි.
ප්‍රතිකාරයෙන් පසු හිස කෙස් 
නැවත වැඩෙනු ඇත.

🧠 මතකය හෝ සිතීමේ වෙනස්කම්
සමහර විට ව්‍යාකූල දැනිය හැක.
මෙය සාමාන්‍ය සහ සාමාන්‍යයෙන් 
හොඳ වේ. ඔබට කරදරයක් 
නම් වෛද්‍යවරයාට කියන්න.

🦴 රසායනික ප්‍රතිකාරයෙන් 
   පසු ඇටකටු හෝ උකුල් වේදනාව
මෙය දන්නා අතුරු ආබාධයකි.
වෛද්‍යවරයාට කියන්න — 
ඔවුන්ට උදව් කළ හැක.`,
      `හොඳ පෝෂණය ඔබේ ශරීරයට 
ප්‍රතිකාර දරාගෙන වේගයෙන් 
සුව වීමට උදව් කරයි.

✅ හොඳ ආහාර:
- බත්, පාන්, රොටී — ශක්තිය ලබාදේ
- මාළු, බිත්තර, කුකුල් මස්, 
  පරිප්පු — ශක්තිය ගොඩනඟයි
- පලතුරු සහ එළවළු — 
  ශරීරයේ ප්‍රතිශක්තිය වැඩි කරයි
- දිනකට වතුර වීදුරු 8ක් 
  පානය කරන්න

❌ වළකින්න:
- ඉතාම매운 හෝ තෙල් සහිත ආහාර
- අධික සීනි සහ පැණිරස
- මත්පැන් සම්පූර්ණයෙන්ම
- රසායනික ප්‍රතිකාර අතරතුර 
  අමු ආහාර

🥤 කුසගිනි නැත්නම්:
- දිනකට 5-6 වතාවක් කුඩා 
  ආහාර ගන්න
- කැඳ, සුප්, හෝ දී බත් 
  වැනි මෘදු ආහාර උත්සාහ කරන්න
- ජලය හෝ කිතුල් ජලය සිප් කරන්න
- ප්‍රෝටීන් පාන ගැනීම 
  උදව් කළ හැක

පෝෂණ සැලැස්මක් සඳහා 
ඔබේ වෛද්‍යවරයාගෙන් 
ආහාරවේදියෙකු වෙත 
යොමු කිරීමක් ඉල්ලන්න.`,
      `ශ්‍රේණිය 2 රෝග විනිශ්චයක් 
ලැබීම ඉතා කරදරකාරී 
දැනිය හැක.
ඔබේ හැඟීම් සම්පූර්ණයෙන්ම 
වලංගුයි.

මෙවැනි හැඟීම් සාමාන්‍යයි:
- බිය හෝ කනස්සල්ල
- දුක හෝ කෝපය
- ව්‍යාකූලතාවය
- ඔබේ පවුල ගැන කනස්සල්ල

💙 උදව් කළ හැකි දේ:
- පවුල හෝ විශ්වාසනීය 
  මිතුරෙකු සමඟ විවෘතව 
  කතා කරන්න
- පිළිකා සහාය කණ්ඩායමකට 
  සම්බන්ධ වන්න
- ඔබ ආදරය කරන දේ කරන්න
- ශරීරයට අවශ්‍ය විට විවේකය ගන්න
- යාඥාව හෝ භාවනාව කරන්න

🗣️ ඔබේ වෛද්‍යවරයාට කියන්න:
- දිගු කාලයක් ඉතා දුකක් දැනීම
- නිදා ගත නොහැකි වීම
- බලාපොරොත්තු රහිත හැඟීම
- තනිව සිටීමට බය
- සෑම දෙයකටම උනන්දුව 
  නැතිවීම

ඔබේ මානසික සෞඛ්‍යය ඔබේ 
ශාරීරික සෞඛ්‍යය තරමෙන්ම 
වැදගත්.
ඔබේ රැකවරණ කණ්ඩායම 
ඔබ සඳහා සම්පූර්ණයෙන්ම 
මෙහි සිටී — ශරීරය සහ 
මනස දෙකටම.
ඔබ සිතනවාට වඩා ශක්තිමත්. 💙`
    ],
    ta: [
      `உங்கள் மூளையில் "க்ளியோமா" என்ற 
வளர்ச்சி இருப்பதை கண்டுபிடித்துள்ளார்.
தரம் 2 — இது மெதுவாக வளரும் 
ஆனால் கவனமாக கவனிக்க வேண்டிய 
வகை.

தரம் 2 இன்னும் குறைந்த தர கட்டி.
சரியான சிகிச்சை மற்றும் கண்காணிப்புடன் 
தரம் 2 க்ளியோமா உள்ள பலர் 
பல ஆண்டுகள் வாழ்கிறார்கள்.

உங்கள் மருத்துவர் இதை கண்டுபிடித்து 
உங்களுக்காக சிகிச்சை திட்டம் 
தயார் செய்துள்ளார்.
இந்த பயணத்தில் நீங்கள் 
தனியாக இல்லை.`,
      `தரம் 2 க்ளியோமாவுக்கு 
சிகிச்சையில் அடங்கலாம்:

🔪 அறுவை சிகிச்சை
உங்கள் மருத்துவர் பாதுகாப்பாக 
முடிந்தவரை வளர்ச்சியை 
அகற்றுவார்.
இது பெரும்பாலும் முதல் படியாகும்.

☢️ கதிர்வீச்சு சிகிச்சை
அறுவை சிகிச்சைக்கு பிறகு 
எந்த செல்களும் மிச்சமில்லாமல் 
இருக்க கதிர்வீச்சு சிகிச்சை 
பரிந்துரைக்கப்படலாம்.
இது பல வாரங்களாக தரப்படும்.

💊 கீமோதெரபி
டெமோசோலோமைட் மாத்திரைகள் 
வளர்ச்சி மீண்டும் வராமல் 
தடுக்க தரப்படலாம்.

உங்கள் குறிப்பிட்ட நிலைமைக்கு 
சிறந்த சிகிச்சையை உங்கள் 
மருத்துவர் தீர்மானிப்பார்.
எப்போதும் மருத்துவரின் 
அறிவுரையை பின்பற்றுங்கள்.`,
      `🔴 இப்போதே மருத்துவமனைக்கு செல்லுங்கள்:
- உடல் நடுங்குதல் அல்லது வலிப்பு
- திடீர் கடுமையான தலைவலி
- திடீரென்று பேச முடியாமல் போவது
- உடலின் ஒரு பக்கம் பலவீனமாவது
- நனவு இழப்பு
- திடீரென்று பார்க்க முடியாமல் போவது

🟡 இன்றே மருத்துவரை அழையுங்கள்:
- தினமும் மோசமாகும் தலைவலி
- இரண்டு முறைக்கும் மேல் வாந்தி
- மிகவும் குழப்பம் அல்லது மறதி
- பார்வை மங்கலாவது
- 38.5°C க்கும் அதிகமான காய்ச்சல்
- வழக்கத்தை விட மிகவும் மோசமாக உணர்வது

🟢 இயல்பானவை — பயப்பட வேண்டாம்:
- சிகிச்சையின் போது சோர்வு
- மிதமான குமட்டல்
- முடி மெலிதல்
- சில நேரங்களில் உணர்ச்சிவசப்படுவது`,
      `உங்கள் அடுத்த சந்திப்பில் 
இந்த கேள்விகளை கேளுங்கள்:

- இப்போது அறுவை சிகிச்சை 
  தேவையா இல்லையா?
- அறுவை சிகிச்சையின் 
  அபாயங்கள் என்ன?
- எத்தனை கதிர்வீச்சு 
  அமர்வுகள் தேவை?
- கீமோதெரபி எவ்வளவு 
  காலம் நீடிக்கும்?
- என்ன பக்க விளைவுகளை 
  எதிர்பார்க்கலாம்?
- என் அடுத்த MRI எப்போது?
- சிகிச்சையின் போது 
  வேலை செய்யலாமா?
- என்ன செயல்களை தவிர்க்க வேண்டும்?`,
      `சிகிச்சை சில பக்க விளைவுகளை 
ஏற்படுத்தலாம்.
இவை உங்கள் உடல் போராடி 
குணமடையும் அறிகுறிகள்!

😴 சோர்வு
சிகிச்சையின் போது மிகவும் இயல்பானது.
தேவைப்படும்போது ஓய்வெடுங்கள்.
சிறிய நடைப்பயிற்சி உதவும்.

🤢 குமட்டல்
அடிக்கடி சிறிய அளவில் சாப்பிடுங்கள்.
கடுமையான வாசனைகளை தவிருங்கள்.
மருத்துவர் மருந்து தரலாம்.

💇 முடி மெலிதல் அல்லது உதிர்வு
இது தற்காலிகமானது.
சிகிச்சைக்கு பிறகு முடி 
மீண்டும் வளரும்.

🧠 நினைவாற்றல் அல்லது சிந்தனை மாற்றங்கள்
சில நேரங்களில் குழப்பமாக உணரலாம்.
இது இயல்பானது மற்றும் சரியாகும்.
தொந்தரவாக இருந்தால் மருத்துவரிடம் சொல்லுங்கள்.

🦴 கீமோதெரபிக்கு பிறகு 
   எலும்பு அல்லது இடுப்பு வலி
இது தெரிந்த பக்க விளைவு.
மருத்துவரிடம் சொல்லுங்கள் — 
அவர்கள் உதவுவார்கள்.`,
      `நல்ல ஊட்டச்சத்து உங்கள் உடலுக்கு 
சிகிச்சையை தாங்கி வேகமாக 
குணமடைய உதவுகிறது.

✅ நல்ல உணவுகள்:
- சோறு, ரொட்டி, சப்பாத்தி — 
  ஆற்றல் தருகிறது
- மீன், முட்டை, கோழி, பருப்பு — 
  வலிமை கொடுக்கிறது
- பழங்கள் மற்றும் காய்கறிகள் — 
  நோய் எதிர்ப்பு சக்தி அதிகரிக்கும்
- தினமும் குறைந்தது 8 கிளாஸ் 
  தண்ணீர் குடியுங்கள்

❌ தவிர்க்க வேண்டியவை:
- மிகவும் காரமான அல்லது 
  எண்ணெய் உணவுகள்
- அதிக சர்க்கரை மற்றும் இனிப்புகள்
- மது முற்றிலும்
- கீமோதெரபியின் போது 
  பச்சை உணவுகள்

🥤 பசியின்மை இருந்தால்:
- ஒரு நாளில் 5-6 முறை சிறிய 
  அளவில் சாப்பிடுங்கள்
- கஞ்சி, சூப் போன்ற மென்மையான 
  உணவுகளை முயற்சிக்கவும்
- தண்ணீர் அல்லது இளநீர் குடியுங்கள்
- புரத பானங்கள் உதவும்

தனிப்பட்ட உணவு திட்டத்திற்கு 
மருத்துவரிடம் ஊட்டச்சத்து 
நிபுணரை பரிந்துரைக்கக் கேளுங்கள்.`,
      `தரம் 2 நோய் கண்டறிதல் பெறுவது`
    ]
  },

  // ── GLIOMA GRADE III ──────────────────────────────────────────────
  glioma_3: {
    meta: {
      name: { en: 'Glioma Grade III', si: 'ග්ලියෝමා - ශ්‍රේණිය 3', ta: 'க்ளியோமா - தரம் 3' },
      accent: '#1e40af', accentBg: '#eff6ff', icon: 'G3'
    },
    en: [
      `You have a type of brain growth called 
Glioma. It is Grade 3 — this means it 
is an active growing tumor that needs 
treatment now.

Grade 3 is called a high grade tumor. 
This does not mean there is no hope. 
Many people receive effective treatment 
for Grade 3 Glioma and live well.

Your doctor has confirmed this after 
careful testing and has a treatment 
plan ready for you.
You are in the right place and 
your care team is with you.`,
      `Grade 3 Glioma needs active treatment. 
Your plan will likely include:

🔪 SURGERY
Remove as much of the growth 
as safely possible.
This is usually the first step.

☢️ RADIATION THERAPY
6 weeks of daily radiation treatment.
This destroys remaining growth cells.
You attend hospital daily for this.

💊 CHEMOTHERAPY
Temozolomide tablets are given 
during and after radiation.
One cycle = 28 days.
Usually 6 to 8 cycles total.

Your doctor will explain your exact 
plan at your next appointment.
Always take medicines as prescribed.
Never stop medicines without 
asking your doctor first.`,
      `🔴 GO TO HOSPITAL RIGHT NOW IF:
- Seizure or body shaking
- Cannot speak suddenly
- One side of body goes very weak
- Sudden very severe headache
- You lose consciousness
- Sudden vision loss
- Cannot recognize family members

🟡 CALL YOUR DOCTOR TODAY IF:
- Headache getting worse every day
- Vomiting more than twice
- Fever above 38.5°C
- Feeling very confused
- Vision becoming blurry
- Much more tired than usual
- New symptoms you have not had before

🟢 NORMAL DURING TREATMENT:
- Tiredness — very common
- Mild nausea
- Hair loss — temporary
- Hip or bone pain after chemo
  → This is normal, tell your doctor
- Feeling emotional`,
      `Important questions to ask:

- What is my exact treatment plan?
- How many chemotherapy cycles?
- How many radiation sessions?
- What side effects should I expect?
- When is my next MRI scan?
- What activities should I avoid?
- Can I work during treatment?
- What foods should I eat or avoid?
- Who do I call in an emergency?
- Is there a support group I can join?
- What happens after treatment ends?`,
      `Treatment side effects are manageable. 
Your care team will help you through them.

😴 TIREDNESS — Very common
Rest when you need to.
Short gentle walks can help.
Do not push yourself too hard.

🤢 NAUSEA
Eat small frequent meals.
Cold foods may be easier to tolerate.
Your doctor can prescribe medicine.

💇 HAIR LOSS
Happens gradually during radiation.
It is temporary — hair grows back 
after treatment ends.
Some people use soft head coverings.

🧠 MEMORY AND THINKING CHANGES
You may feel foggy or forgetful.
This is common and usually improves.
Puzzles and reading can gently help.

🦴 HIP OR BONE PAIN AFTER CHEMO
A known side effect of Temozolomide.
Always tell your doctor about this.
Do not ignore bone pain.

😔 FEELING LOW OR ANXIOUS
Completely normal and expected.
Please tell your care team.
Support is available for you.

Remember — these side effects 
mean the treatment is working.
Your care team is always there 
to help manage them!`,
      `Good nutrition is very important 
during Grade 3 treatment to keep 
your strength up.

✅ GOOD FOODS TO EAT:
- Rice, bread, roti — steady energy
- Fish, eggs, chicken, lentils — 
  protein for strength
- Fruits and vegetables — 
  immunity and healing
- Dairy — milk, curd, cheese
- Drink at least 8-10 glasses 
  of water daily

❌ AVOID THESE:
- Very spicy or oily food 
  especially if nauseous
- Raw or unwashed foods during 
  chemotherapy — infection risk
- Alcohol completely
- Grapefruit — interferes 
  with some medicines

🥤 WHEN APPETITE IS VERY LOW:
- Eat small amounts every 
  2 to 3 hours
- Soft foods — porridge, 
  soup, curd rice, banana
- Protein shakes or 
  nutritional drinks can help
- Sip coconut water or 
  oral rehydration solution
- Never skip meals completely

⚠️ IMPORTANT:
Tell your doctor if you are 
losing weight rapidly.
A dietitian can be arranged 
for a personal nutrition plan.`,
      `A Grade 3 diagnosis brings many 
emotions. All of them are valid 
and understandable.

You may feel:
- Scared or overwhelmed
- Angry — why me?
- Sad or hopeless sometimes
- Worried about your loved ones
- Uncertain about the future

💙 THINGS THAT GENUINELY HELP:
- Talk openly with someone 
  you completely trust
- Let your family support you — 
  you do not have to be strong 
  all the time
- Join a cancer support group — 
  meeting others who understand 
  is very powerful
- Do small things you enjoy 
  when you have energy
- Rest without guilt
- Pray or meditate if it 
  brings you comfort

🗣️ PLEASE TELL YOUR DOCTOR IF:
- You feel very sad for many days
- You cannot sleep at all
- You feel completely hopeless
- You are having very dark thoughts
- You feel you cannot cope

Professional mental health support 
is available and it helps.
Asking for help is a sign 
of strength — not weakness.

You are not alone.
Your care team is with you 
every single step of the way. 💙`
    ],
    si: [
      `ඔබේ මොළයේ "ග්ලියෝමා" නම් 
වර්ධනයක් ඇති බව සොයාගෙන ඇත.
ශ්‍රේණිය 3 — මෙය දැන් ප්‍රතිකාර 
අවශ්‍ය වන ක්‍රියාකාරීව වැඩෙන 
ගෙඩියකි.

ශ්‍රේණිය 3 ඉහළ ශ්‍රේණියේ 
ගෙඩියක් ලෙස හැඳින්වේ.
මෙය බලාපොරොත්තුවක් නොමැති 
බව අදහස් නොකෙරේ.
ශ්‍රේණිය 3 ග්ලියෝමාට ඵලදායී 
ප්‍රතිකාර ලැබෙන බොහෝ 
අය හොඳින් ජීවත් වෙති.

ඔබේ වෛද්‍යවරයා සූක්ෂ්ම 
පරීක්ෂාවෙන් පසු මෙය 
තහවුරු කර ඔබ සඳහා 
ප්‍රතිකාර සැලැස්මක් 
සකස් කර ඇත.
ඔබ නිවැරදි ස්ථානයේ සිටී 
සහ ඔබේ රැකවරණ කණ්ඩායම 
ඔබ සමඟ සිටී.`,
      `ශ්‍රේණිය 3 ග්ලියෝමාට 
ක්‍රියාකාරී ප්‍රතිකාරයක් 
අවශ්‍ය වේ.
ඔබේ සැලැස්මට ඇතුළත් 
විය හැකි:

🔪 ශල්‍යකර්මය
ආරක්ෂිතව හැකිතාක් 
වර්ධනය ඉවත් කිරීම.
සාමාන්‍යයෙන් මෙය 
පළමු පියවරයි.

☢️ විකිරණ ප්‍රතිකාරය
සති 6ක් දෛනික විකිරණ 
ප්‍රතිකාරය.
ඉතිරි වර්ධන සෛල 
විනාශ කරයි.
ඔබ දිනපතා රෝහලට 
යා යුතු වේ.

💊 රසායනික ප්‍රතිකාරය
විකිරණ ප්‍රතිකාරය 
අතරතුර සහ පසු 
ටෙමොසොලොමයිඩ් 
ටැබ්ලට් දෙනු ලැබේ.
එක් චක්‍රයක් = දින 28.
සාමාන්‍යයෙන් චක්‍ර 6-8ක්.

ඔබේ ඊළඟ හමුවේදී 
ඔබේ වෛද්‍යවරයා ඔබේ 
නිශ්චිත සැලැස්ම 
පැහැදිලි කරනු ඇත.
නියම පරිදි ඖෂධ 
සැමවිටම ගන්න.
වෛද්‍යවරයාගෙන් 
අසා නොමැතිව 
ඖෂධ නොනවත්වන්න.`,
      `🔴 දැන්ම රෝහලට යන්න:
- ආයාසය හෝ ශරීරය 
  කම්පා වීම
- හදිසියේ කතා කිරීමට 
  නොහැකි වීම
- ශරීරයේ එක් පැත්තක් 
  ඉතා දුර්වල වීම
- හදිසි ඉතා දරුණු හිසරදය
- ඥානය නැතිවීම
- හදිසි දෘෂ්ටි喪失
- පවුලේ අය හඳුනා 
  ගැනීමට නොහැකි වීම

🟡 අද වෛද්‍යවරයාට කතා කරන්න:
- දිනෙන් දින නරක් වන හිසරදය
- දෙවතාවකට වඩා වමනය
- 38.5°C ට වඩා උෂ්ණත්වය
- ඉතා ව්‍යාකූලතාවය
- දෑස් අපැහැදිලි වීම
- සාමාන්‍යයට වඩා ඉතා 
  වෙහෙසකාරී දැනීම

🟢 ප්‍රතිකාර අතරතුර සාමාන්‍ය:
- තෙහෙට්ටුව — ඉතාම සාමාන්‍යයි
- මෘදු ඔක්කාරය
- හිස කෙස් හැලීම — තාවකාලිකයි
- රසායනික ප්‍රතිකාරයෙන් 
  පසු උකුල් හෝ ඇටකටු 
  වේදනාව → සාමාන්‍යයි, 
  වෛද්‍යවරයාට කියන්න
- චිත්තවේගීය වීම`,
      `වැදගත් ප්‍රශ්න:

- මගේ නිශ්චිත ප්‍රතිකාර 
  සැලැස්ම කුමක්ද?
- රසායනික ප්‍රතිකාර 
  චක්‍ර කීයක්ද?
- විකිරණ සැසි කීයක්ද?
- කුමන අතුරු ආබාධ 
  අපේක්ෂා කළ යුතුද?
- මගේ ඊළඟ MRI 
  පරීක්ෂාව කවදාද?
- කුමන ක්‍රියාකාරකම් 
  වළකින්න ඕනේද?
- ප්‍රතිකාර අතරතුර 
  රැකියාව කළ හැකිද?
- කුමන ආහාර ගත යුතු 
  හෝ නොගත යුතුද?
- හදිසි අවස්ථාවකදී 
  කාට කතා කළ යුතුද?
- ප්‍රතිකාරය අවසාන 
  වූ පසු කුමක් සිදුවේද?`,
      `ප්‍රතිකාර අතුරු ආබාධ 
කළමනාකරණය කළ හැකිය.
ඔබේ රැකවරණ කණ්ඩායම 
ඒ හරහා ඔබට උදව් කරනු ඇත.

😴 තෙහෙට්ටුව — ඉතාම සාමාන්‍යයි
අවශ්‍ය විට විවේකය ගන්න.
කෙටි මෘදු ඇවිදීම 
උදව් කළ හැක.
ඔබව ඉතා වෙහෙසට 
නොපත් කරන්න.

🤢 ඔක්කාරය
කෙටි ආහාර නිතර ගන්න.
සීතල ආහාර ඉවසීමට 
පහසු විය හැක.
ඔබේ වෛද්‍යවරයාට 
ඖෂධ නියම කළ හැක.

💇 හිස කෙස් හැලීම
විකිරණ ප්‍රතිකාරය 
අතරතුර ක්‍රමයෙන් සිදු වේ.
ප්‍රතිකාරය අවසාන වූ 
පසු හිස කෙස් නැවත 
වැඩෙනු ඇත.
සමහරු මෘදු හිස 
ආවරණ භාවිත කරයි.

🧠 මතකය සහ සිතීමේ 
   වෙනස්කම්
ව්‍යාකූල හෝ අමතක 
දැනිය හැක.
මෙය සාමාන්‍ය සහ 
සාමාන්‍යයෙන් හොඳ වේ.

🦴 රසායනික ප්‍රතිකාරයෙන් 
   පසු උකුල් හෝ ඇටකටු 
   වේදනාව
ටෙමොසොලොමයිඩ්හි 
දන්නා අතුරු ආබාධයකි.
සෑම විටම ඔබේ 
වෛද්‍යවරයාට කියන්න.
ඇටකටු වේදනාව 
නොසලකා නොහරින්න.

😔 පහත් හෝ කනස්සල්ල දැනීම
සම්පූර්ණයෙන්ම සාමාන්‍ය.
ඔබේ රැකවරණ 
කණ්ඩායමට කියන්න.
ඔබ සඳහා සහාය 
ලැබිය හැකිය.`,
      `ශ්‍රේණිය 3 ප්‍රතිකාරය 
අතරතුර ශක්තිය රැකගැනීමට 
හොඳ පෝෂණය ඉතා 
වැදගත් වේ.

✅ හොඳ ආහාර:
- බත්, පාන්, රොටී — 
  ස්ථාවර ශක්තිය
- මාළු, බිත්තර, කුකුල් 
  මස්, පරිප්පු — ශක්තිය
- පලතුරු සහ එළවළු — 
  ප්‍රතිශක්තිය සහ සුව කිරීම
- කිරි නිෂ්පාදන — කිරි, 
  දෝ, චීස්
- දිනකට වතුර වීදුරු 
  8-10ක් පානය කරන්න

❌ වළකින්න:
- ඉතාම매운 හෝ තෙල් 
  සහිත ආහාර
- රසායනික ප්‍රතිකාරය 
  අතරතුර අමු ආහාර
- මත්පැන් සම්පූර්ණයෙන්ම
- ද්‍රාක්ෂා ඵලය — 
  සමහර ඖෂධ සමඟ 
  ගැටුම් ඇති කරයි

🥤 ඉතාම කුසගිනි 
   නැත්නම්:
- පැය 2-3 කට වරක් 
  කුඩා ආහාර ගන්න
- මෘදු ආහාර — කැඳ, 
  සුප්, දී බත්, කෙසෙල්
- ප්‍රෝටීන් පාන හෝ 
  පෝෂක පාන උදව් 
  කළ හැක
- කිතුල් ජලය හෝ ORS 
  සිප් කරන්න

⚠️ වැදගත්:
ඔබේ බර ඉක්මනින් 
අඩු වන්නේ නම් 
වෛද්‍යවරයාට කියන්න.`,
      `ශ්‍රේණිය 3 රෝග විනිශ්චයක් 
ලැබීම බොහෝ හැඟීම් 
ගෙනෙයි. ඒ සියල්ල 
වලංගු සහ තේරුම් 
ගත හැකිය.

ඔබට දැනිය හැකිය:
- බිය හෝ ගිලෙනා 
  දැනීමක්
- කෝපය — ඇයි මට?
- සමහර විට දුක 
  හෝ බලාපොරොත්තු රහිත
- ආදරණීයයන් ගැන 
  කනස්සල්ල
- අනාගතය ගැන 
  අවිනිශ්චිතතාවය

💙 ඇත්තටම උදව් 
   කරන දේ:
- සම්පූර්ණයෙන්ම 
  විශ්වාස කරන 
  කෙනෙකු සමඟ 
  විවෘතව කතා කරන්න
- ඔබේ පවුලට ඔබව 
  සහය කිරීමට ඉඩ දෙන්න
- පිළිකා සහාය 
  කණ්ඩායමකට 
  සම්බන්ධ වන්න
- ශක්තිය ඇති විට 
  ඔබ ආදරය කරන 
  කුඩා දේ කරන්න
- වරදක් නොමැතිව 
  විවේකය ගන්න
- යාඥාව හෝ භාවනාව 
  සැනසිල්ල ගෙනෙනවා 
  නම් කරන්න

🗣️ ඔබේ වෛද්‍යවරයාට 
   කියන්න:
- දිගු දිනවල ඉතා 
  දුකක් දැනීම
- කිසිසේත්ම නිදා 
  ගැනීමට නොහැකි වීම
- සම්පූර්ණ 
  බලාපොරොත්තු 
  රහිත දැනීම
- ඉතා අඳුරු සිතුවිලි
- කළමනාකරණය 
  කළ නොහැකි දැනීම

වෘත්තීය මානසික 
සෞඛ්‍ය සහාය ලැබිය 
හැකි අතර එය 
උදව් කරයි.
සහාය ඉල්ලීම 
ශක්තියේ ලකුණකි — 
දුර්වලතාවයේ නොවේ.

ඔබ තනිව නොසිටී.
ඔබේ රැකවරණ 
කණ්ඩායම ඔබ සමඟ 
සෑම පියවරකදීම 
සිටී. 💙`
    ],
    ta: [
      `உங்கள் மூளையில் "க்ளியோமா" என்ற 
வளர்ச்சி இருப்பதை கண்டுபிடித்துள்ளார்.
தரம் 3 — இது இப்போது சிகிச்சை 
தேவைப்படும் தீவிரமாக வளரும் கட்டி.

தரம் 3 உயர் தர கட்டி என்று 
அழைக்கப்படுகிறது.
இது நம்பிக்கை இல்லை என்று 
அர்த்தமில்லை.
தரம் 3 க்ளியோமாவுக்கு 
பயனுள்ள சிகிச்சை பெறும் 
பலர் நல்லாக வாழ்கிறார்கள்.

உங்கள் மருத்துவர் கவனமான 
சோதனைக்கு பிறகு இதை 
உறுதிப்படுத்தி உங்களுக்காக 
சிகிச்சை திட்டம் தயார் 
செய்துள்ளார்.
நீங்கள் சரியான இடத்தில் 
இருக்கிறீர்கள் மற்றும் 
உங்கள் பராமரிப்பு குழு 
உங்களுடன் இருக்கிறது.`,
      `தரம் 3 க்ளியோமாவுக்கு 
தீவிர சிகிச்சை தேவை.
உங்கள் திட்டத்தில் 
அடங்கலாம்:

🔪 அறுவை சிகிச்சை
பாதுகாப்பாக முடிந்தவரை 
வளர்ச்சியை அகற்றுவது.
இது பொதுவாக முதல் படியாகும்.

☢️ கதிர்வீச்சு சிகிச்சை
6 வாரங்கள் தினசரி 
கதிர்வீச்சு சிகிச்சை.
மீதமுள்ள வளர்ச்சி 
செல்களை அழிக்கிறது.
இதற்கு தினமும் 
மருத்துவமனை போக வேண்டும்.

💊 கீமோதெரபி
கதிர்வீச்சு சிகிச்சையின் 
போதும் பிறகும் 
டெமோசோலோமைட் 
மாத்திரைகள் தரப்படுகின்றன.
ஒரு சுழற்சி = 28 நாட்கள்.
பொதுவாக 6 முதல் 8 
சுழற்சிகள்.

உங்கள் அடுத்த சந்திப்பில் 
மருத்துவர் உங்கள் 
சரியான திட்டத்தை 
விளக்குவார்.
எப்போதும் மருந்துகளை 
நியமிக்கப்பட்டபடி எடுங்கள்.
மருத்துவரிடம் கேட்காமல் 
மருந்துகளை நிறுத்தாதீர்கள்.`,
      `🔴 இப்போதே மருத்துவமனைக்கு செல்லுங்கள்:
- வலிப்பு அல்லது உடல் நடுங்குதல்
- திடீரென்று பேச முடியாமல் போவது
- உடலின் ஒரு பக்கம் மிகவும் 
  பலவீனமாவது
- திடீர் மிகவும் கடுமையான தலைவலி
- நனவு இழப்பு
- திடீர் பார்வை இழப்பு
- குடும்பத்தினரை அடையாளம் 
  காண முடியாமல் போவது

🟡 இன்றே மருத்துவரை அழையுங்கள்:
- தினமும் மோசமாகும் தலைவலி
- இரண்டு முறைக்கும் மேல் வாந்தி
- 38.5°C க்கும் அதிகமான காய்ச்சல்
- மிகவும் குழப்பமான உணர்வு
- பார்வை மங்கலாவது
- வழக்கத்தை விட மிகவும் 
  சோர்வாக உணர்வது

🟢 சிகிச்சையின் போது இயல்பானவை:
- சோர்வு — மிகவும் இயல்பானது
- மிதமான குமட்டல்
- முடி உதிர்வு — தற்காலிகமானது
- கீமோதெரபிக்கு பிறகு 
  இடுப்பு அல்லது எலும்பு வலி
  → இயல்பானது, மருத்துவரிடம் சொல்லுங்கள்
- உணர்ச்சிவசப்படுவது`,
      `முக்கியமான கேள்விகள்:

- என் சரியான சிகிச்சை 
  திட்டம் என்ன?
- எத்தனை கீமோதெரபி 
  சுழற்சிகள்?
- எத்தனை கதிர்வீச்சு அமர்வுகள்?
- என்ன பக்க விளைவுகளை 
  எதிர்பார்க்கலாம்?
- என் அடுத்த MRI எப்போது?
- என்ன செயல்களை தவிர்க்க வேண்டும்?
- சிகிச்சையின் போது வேலை 
  செய்யலாமா?
- என்ன உணவுகளை சாப்பிட 
  வேண்டும் அல்லது தவிர்க்க வேண்டும்?
- அவசரநிலையில் யாரை 
  அழைக்க வேண்டும்?
- சிகிச்சை முடிந்த பிறகு 
  என்ன நடக்கும்?`,
      `சிகிச்சை பக்க விளைவுகளை 
நிர்வகிக்கலாம்.
உங்கள் பராமரிப்பு குழு 
அவற்றை கடக்க உதவும்.

😴 சோர்வு — மிகவும் இயல்பானது
தேவைப்படும்போது ஓய்வெடுங்கள்.
சிறிய மென்மையான நடைப்பயிற்சி 
உதவும்.
உங்களை அதிகமாக 
கஷ்டப்படுத்திக்கொள்ளாதீர்கள்.

🤢 குமட்டல்
அடிக்கடி சிறிய அளவில் சாப்பிடுங்கள்.
குளிர்ந்த உணவுகள் 
சகிப்பதற்கு எளிதாக இருக்கலாம்.
மருத்துவர் மருந்து தரலாம்.

💇 முடி உதிர்வு
கதிர்வீச்சு சிகிச்சையின் போது 
படிப்படியாக நடக்கும்.
சிகிச்சை முடிந்த பிறகு 
முடி மீண்டும் வளரும்.
சிலர் மென்மையான தலை 
ஆடைகளை பயன்படுத்துகிறார்கள்.

🧠 நினைவாற்றல் மற்றும் 
   சிந்தனை மாற்றங்கள்
குழப்பமாக அல்லது மறதியாக 
உணரலாம்.
இது இயல்பானது மற்றும் 
பொதுவாக சரியாகும்.

🦴 கீமோதெரபிக்கு பிறகு 
   இடுப்பு அல்லது எலும்பு வலி
டெமோசோலோமைட்டின் 
தெரிந்த பக்க விளைவு.
எப்போதும் மருத்துவரிடம் சொல்லுங்கள்.
எலும்பு வலியை புறக்கணிக்காதீர்கள்.

😔 சோர்வாக அல்லது 
   கவலையாக உணர்வது
முற்றிலும் இயல்பானது.
உங்கள் பராமரிப்பு 
குழுவிடம் சொல்லுங்கள்.
உங்களுக்கு ஆதரவு கிடைக்கும்.`,
      `தரம் 3 சிகிச்சையின் போது 
உங்கள் வலிமையை 
பராமரிக்க நல்ல ஊட்டச்சத்து 
மிகவும் முக்கியம்.

✅ நல்ல உணவுகள்:
- சோறு, ரொட்டி, சப்பாத்தி — 
  நிலையான ஆற்றல்
- மீன், முட்டை, கோழி, பருப்பு — 
  வலிமைக்கு புரதம்
- பழங்கள் மற்றும் காய்கறிகள் — 
  நோய் எதிர்ப்பு சக்தி மற்றும் குணமடைதல்
- பால் பொருட்கள் — பால், தயிர், பனீர்
- தினமும் குறைந்தது 8-10 
  கிளாஸ் தண்ணீர் குடியுங்கள்

❌ தவிர்க்க வேண்டியவை:
- மிகவும் காரமான அல்லது 
  எண்ணெய் உணவுகள்
- கீமோதெரபியின் போது 
  பச்சை உணவுகள்
- மது முற்றிலும்
- திராட்சைப்பழம் — சில 
  மருந்துகளுடன் தலையிடுகிறது

🥤 பசியின்மை மிகவும் 
   அதிகமாக இருந்தால்:
- 2 முதல் 3 மணி நேரத்திற்கு 
  ஒரு முறை சிறிய 
  அளவில் சாப்பிடுங்கள்
- மென்மையான உணவுகள் — 
  கஞ்சி, சூப், தயிர் சோறு, வாழைப்பழம்
- புரத பானங்கள் அல்லது 
  ஊட்டச்சத்து பானங்கள் உதவும்
- இளநீர் அல்லது ORS குடியுங்கள்

⚠️ முக்கியம்:
உங்கள் எடை வேகமாக 
குறைந்தால் மருத்துவரிடம் சொல்லுங்கள்.`,
      `தரம் 3 நோய் கண்டறிதல்`
    ]
  },

  // ── GLIOMA GRADE IV (GBM) ──────────────────────────────────────────────
  glioma_4: {
    meta: {
      name: { en: 'Glioma Grade IV (GBM)', si: 'ග්ලියෝමා - ශ්‍රේණිය 4', ta: 'க்ளியோமா - தரம் 4 (GBM)' },
      accent: '#1e3a8a', accentBg: '#eff6ff', icon: 'G4'
    },
    en: [
      `You have a type of brain growth called 
Glioma. It is Grade 4 — also known as 
Glioblastoma or GBM.

Grade 4 is the most active type of 
brain tumor. It grows faster than 
lower grades and needs immediate 
and strong treatment.

We want to be honest with you while 
also giving you hope. Many people 
with Grade 4 Glioma respond well 
to treatment and continue to live 
meaningful lives with their families.

Your doctor has confirmed this after 
careful testing. A treatment plan 
has been prepared specifically for you.
Your care team is fully committed 
to supporting you every step of the way.`,
      `Grade 4 Glioma requires immediate 
and aggressive treatment. Your plan 
will include:

🔪 SURGERY
Remove as much of the growth as 
safely possible.
This is done as soon as possible.

☢️ RADIATION THERAPY
6 weeks of daily radiation treatment.
You attend hospital every weekday.
This destroys remaining tumor cells.

💊 CHEMOTHERAPY
Temozolomide tablets during 
and after radiation.
During radiation: daily tablets.
After radiation: 5 days on, 
23 days off per cycle.
Usually 6 cycles total.

💉 ADDITIONAL TREATMENTS
Your doctor may also discuss:
Bevacizumab (Avastin) injections
Tumor Treating Fields (TTFields) device
Clinical trials if available

Your doctor will explain your 
exact plan clearly.
Always take all medicines as prescribed.
Attend every appointment — 
each one matters.`,
      `🔴 GO TO HOSPITAL RIGHT NOW IF:
- Seizure or body shaking
- Cannot speak suddenly
- One side of body goes very weak
- Sudden very severe headache
- You lose consciousness
- Sudden vision loss
- Sudden extreme confusion
- Cannot recognize your family

🟡 CALL YOUR DOCTOR TODAY IF:
- Headache getting worse every day
- Vomiting more than twice
- Fever above 38.5°C
- Feeling very confused or disoriented
- Vision becoming blurry
- Much more tired than yesterday
- New weakness in arms or legs
- Sudden mood or personality changes

🟢 NORMAL DURING TREATMENT:
- Tiredness — very common
- Mild to moderate nausea
- Hair loss — temporary
- Hip or bone pain after chemo
- Memory or thinking changes
- Feeling emotional or low
- Swelling around surgical area 
  initially — normal`,
      `Very important questions to ask:

- What exactly is my treatment plan?
- How many chemotherapy cycles?
- What is Bevacizumab and do I need it?
- What are TTFields and should I use them?
- Are there clinical trials available for me?
- What side effects should I expect?
- When is my next MRI scan?
- What does progression mean?
- What happens if treatment stops working?
- Can I work or travel during treatment?
- What support is available for my family?
- Who do I call in an emergency?
- What is palliative care and when is it needed?`,
      `Treatment for Grade 4 may cause 
stronger side effects. Your care 
team will help you manage all of them.

😴 SEVERE TIREDNESS
Very common with Grade 4 treatment.
Rest as much as you need to.
Even sitting outside in fresh air helps.
Accept help from your family.

🤢 NAUSEA AND VOMITING
Eat very small amounts often.
Cold bland foods are easier.
Anti-nausea medicine is available — 
ask your doctor.

💇 COMPLETE HAIR LOSS
Happens during radiation and chemo.
It is completely temporary.
Hair grows back after treatment.
Wigs or soft head coverings help.

🧠 MEMORY AND COGNITIVE CHANGES
Confusion, forgetfulness, 
difficulty concentrating.
This is common and expected.
Tell your care team — 
occupational therapy can help.

🦴 BONE AND HIP PAIN
From Temozolomide — tell your doctor.
Do not ignore this pain.

💊 STEROID SIDE EFFECTS
If you take dexamethasone steroids:
Weight gain especially in face
Mood changes
Blood sugar increase
These are manageable — 
tell your doctor of any concerns.

😔 FEELING VERY LOW
Completely understandable.
Please do not suffer alone.
Counseling and support 
are available to you.`,
      `For Grade 4 maintaining your 
strength through good nutrition 
is extremely important.

✅ BEST FOODS:
- High protein — fish, eggs, 
  chicken, lentils, cheese, nuts
- Complex carbohydrates — 
  rice, oats, sweet potato
- Colourful fruits and vegetables — 
  berries, leafy greens, carrots
- Healthy fats — coconut oil, 
  avocado, nuts
- Drink 10 glasses of water daily

❌ STRICTLY AVOID:
- Alcohol — completely
- Raw or undercooked food 
  during chemotherapy
- Grapefruit with certain medicines
- Very spicy food if nauseous
- Excessive sugar

🥤 WHEN EATING IS VERY DIFFICULT:
- Small amounts every 2 hours
- Nutritional supplement drinks
- Soft and easy foods — 
  banana, curd, porridge, 
  boiled egg, soup
- Sip fluids constantly 
  throughout the day
- Ask for a feeding tube 
  assessment if needed

⚠️ VERY IMPORTANT:
Tell your doctor immediately if:
You cannot eat for more than 
2 days
You are losing weight very fast
You feel extremely weak

A hospital dietitian can 
create a personal plan for you.`,
      `Receiving a Grade 4 diagnosis is 
one of the most difficult things 
a person can face.

Your feelings — whatever they are — 
are completely valid and human.

You may feel:
- Terrified or in shock
- Angry and asking why me
- Deep sadness or grief
- Worried about your family 
  and what will happen to them
- Uncertain and lost
- Sometimes moments of peace 
  and acceptance

All of these feelings are normal.
There is no right or wrong way to feel.

💙 WHAT GENUINELY HELPS:
- Talk with someone you 
  completely trust
- Let your family love and 
  support you — you do not 
  have to be strong all the time
- Meet a professional counselor 
  or psychologist
- Connect with others who 
  have the same diagnosis — 
  their strength can inspire you
- Do the things that bring 
  you joy when you have energy
- Say what is in your heart 
  to the people you love
- Pray meditate or find 
  peace in whatever brings 
  you comfort

🗣️ PLEASE TELL YOUR DOCTOR IF:
- You feel you cannot go on
- You feel completely hopeless
- You are having very dark thoughts
- You cannot function or get up
- You feel you are a burden 
  to your family

Professional mental health support 
is available and it makes 
a real difference.

Your life has meaning and value.
Your care team believes in 
supporting your quality of life 
completely — not just your treatment.

You are not alone.
We are with you. 💙`
    ],
    si: [
      `ඔබේ මොළයේ "ග්ලියෝමා" නම් 
වර්ධනයක් ඇති බව සොයාගෙන ඇත.
ශ්‍රේණිය 4 — ග්ලියෝබ්ලාස්ටෝමා 
හෝ GBM ලෙසද හැඳින්වේ.

ශ්‍රේණිය 4 මොළ ගෙඩිවල 
වඩාත් ක්‍රියාශීලී වර්ගයයි.
එය පහළ ශ්‍රේණිවලට වඩා 
ඉක්මනින් වැඩෙන නිසා 
වහාම ශක්තිමත් ප්‍රතිකාරයක් 
අවශ්‍ය වේ.

ඔබට අපි සත්‍ය කිවමින්ද 
බලාපොරොත්තුව ද දෙනු 
කැමැත්තෙමු.
ශ්‍රේණිය 4 ග්ලියෝමා 
සහිත බොහෝ අය 
ප්‍රතිකාරයට හොඳ 
ප්‍රතිචාර දක්වන නිසා 
ඔවුන්ගේ පවුල් සමඟ 
අර්ථවත් ජීවිතයක් 
ගත කිරීම දිගටම 
කරගෙන යයි.

ඔබේ වෛද්‍යවරයා 
සූක්ෂ්ම පරීක්ෂාවෙන් 
පසු මෙය තහවුරු කර 
ඔබ සඳහා ප්‍රතිකාර 
සැලැස්මක් සකස් 
කර ඇත.
ඔබේ රැකවරණ කණ්ඩායම 
සෑම පියවරකදීම 
ඔබව සහය කිරීමට 
සම්පූර්ණයෙන්ම 
කැපවී සිටී.`,
      `ශ්‍රේණිය 4 ග්ලියෝමාට 
වහාම සහ ශක්තිමත් 
ප්‍රතිකාරයක් අවශ්‍ය වේ.
ඔබේ සැලැස්මට 
ඇතුළත් වනු ඇත:

🔪 ශල්‍යකර්මය
හැකිතාක් ආරක්ෂිතව 
වර්ධනය ඉවත් කිරීම.
හැකි ඉක්මනින් 
සිදු කෙරේ.

☢️ විකිරණ ප්‍රතිකාරය
සති 6ක් දෛනික 
විකිරණ ප්‍රතිකාරය.
සෑම සතියකම 
රෝහලට යා යුතු වේ.
ඉතිරි ගෙඩි සෛල 
විනාශ කරයි.

💊 රසායනික ප්‍රතිකාරය
විකිරණ ප්‍රතිකාරය 
අතරතුරද පසුවද 
ටෙමොසොලොමයිඩ් 
ටැබ්ලට්.
විකිරණ අතරතුර: 
දෛනික ටැබ්ලට්.
විකිරණ පසු: 
දින 5ක්, දින 23ක් 
නවතා චක්‍රයකි.
සාමාන්‍යයෙන් 
චක්‍ර 6ක්.

💉 අමතර ප්‍රතිකාර
ඔබේ වෛද්‍යවරයා 
සාකච්ඡා කළ හැකිය:
බෙවැසිසුමැබ් 
打针
ගෙඩි ප්‍රතිකාර 
ක්ෂේත්‍ර උපකරණය
ලබාගත හැකි නම් 
සායනික පරීක්ෂණ

ඔබේ නිශ්චිත සැලැස්ම 
ඔබේ වෛද්‍යවරයා 
පැහැදිලිව 
පැහැදිලි කරනු ඇත.
නියම පරිදි 
සියලු ඖෂධ 
සැමවිටම ගන්න.
සෑම හමුවකටම 
පැමිණෙන්න — 
එක් එක් හමුව 
වැදගත්.`,
      `🔴 දැන්ම රෝහලට යන්න:
- ආයාසය හෝ ශරීරය 
  කම්පා වීම
- හදිසියේ කතා කිරීමට 
  නොහැකි වීම
- ශරීරයේ එක් පැත්තක් 
  ඉතා දුර්වල වීම
- හදිසි ඉතා දරුණු හිසරදය
- ඥානය නැතිවීම
- හදිසි දෘෂ්ටි喪失
- හදිසි ඉතා ව්‍යාකූලතාවය
- ඔබේ පවුලේ අය 
  හඳුනා ගැනීමට 
  නොහැකි වීම

🟡 අද වෛද්‍යවරයාට 
   කතා කරන්න:
- දිනෙන් දින නරක් 
  වන හිසරදය
- දෙවතාවකට වඩා වමනය
- 38.5°C ට වඩා 
  උෂ්ණත්වය
- ඉතා ව්‍යාකූල හෝ 
  දිශානති නොමැති දැනීම
- දෑස් අපැහැදිලි වීම
- ඊයේට වඩා ඉතා 
  වෙහෙසකාරී දැනීම
- අත් හෝ කකුල්වල 
  නව දුර්වලතාවය
- හදිසි මනෝභාවය හෝ 
  පෞරුෂ වෙනස්කම්

🟢 ප්‍රතිකාර අතරතුර 
   සාමාන්‍ය:
- තෙහෙට්ටුව — 
  ඉතාම සාමාන්‍යයි
- මෘදු සිට මධ්‍යස්ථ 
  ඔක්කාරය
- හිස කෙස් හැලීම — 
  තාවකාලිකයි
- රසායනික ප්‍රතිකාරයෙන් 
  පසු උකුල් හෝ 
  ඇටකටු වේදනාව
- මතකය හෝ සිතීමේ 
  වෙනස්කම්
- චිත්තවේගීය හෝ 
  පහත් දැනීම
- ශල්‍යකර්ම ප්‍රදේශය 
  වටා ආරම්භයේදී 
  ඉදිමීම — සාමාන්‍යයි`,
      `අහන්න
ඉතා වැදගත් ප්‍රශ්න:

- මගේ ප්‍රතිකාර සැලැස්ම 
  හරියටම කුමක්ද?
- රසායනික ප්‍රතිකාර 
  චක්‍ර කීයක්ද?
- බෙවැසිසුමැබ් යනු 
  කුමක්ද සහ 
  මට අවශ්‍යද?
- TTFields යනු 
  කුමක්ද?
- මට සායනික 
  පරීක්ෂණ 
  ලැබිය හැකිද?
- කුමන අතුරු ආබාධ 
  අපේක්ෂා කළ යුතුද?
- ප්‍රතිකාරය 
  වැඩ නොකළහොත් 
  කුමක් සිදු වේද?
- ප්‍රතිකාර අතරතුර 
  රැකියාව හෝ 
  ගමන් කළ හැකිද?
- හදිසි අවස්ථාවකදී 
  කාට කතා 
  කළ යුතුද?
- සේවා ලක්ෂ්‍ය ප්‍රතිකාරය 
  යනු කුමක්ද?`,
      `බලපෑම්
ශ්‍රේණිය 4 ප්‍රතිකාරය 
ශක්තිමත් අතුරු ආබාධ 
ඇති කළ හැක.
ඔබේ රැකවරණ කණ්ඩායම 
ඒ සියල්ල 
කළමනාකරණය කිරීමට 
උදව් කරනු ඇත.

😴 දරුණු තෙහෙට්ටුව
ශ්‍රේණිය 4 ප්‍රතිකාරය 
සමඟ ඉතාම සාමාන්‍යයි.
ඔබට අවශ්‍ය තරම් 
විවේකය ගන්න.
පවුලෙන් සහාය 
පිළිගන්න.

🤢 ඔක්කාරය සහ වමනය
ඉතා කුඩා 
ප්‍රමාණ නිතර ගන්න.
සීතල සුළු ආහාර 
පහසු වේ.
ප්‍රති-ඔක්කාරය 
ඖෂධ ලැබිය හැකිය.

💇 සම්පූර්ණ හිස 
   කෙස් හැලීම
විකිරණ සහ 
රසායනික ප්‍රතිකාරය 
අතරතුර සිදු වේ.
සම්පූර්ණයෙන්ම 
තාවකාලිකයි.
ප්‍රතිකාරයෙන් පසු 
හිස කෙස් 
නැවත වැඩෙනු ඇත.

🧠 මතකය සහ 
   සංජානන වෙනස්කම්
ව්‍යාකූලතාවය, 
අමතක වීම, 
අවධානය 
යොමු කිරීමේ 
දුෂ්කරතාවය.
මෙය සාමාන්‍ය සහ 
අපේක්ෂිතයි.
ඔබේ රැකවරණ 
කණ්ඩායමට කියන්න.

💊 ස්ටෙරොයිඩ් 
   අතුරු ආබාධ
ඩෙක්සාමෙතසෝන් 
ගන්නවා නම්:
විශේෂයෙන් මුහුණේ 
බර වැඩිවීම
මනෝභාවය 
වෙනස්කම්
රුධිර සීනි 
ඉහළ යාම
මේවා 
කළමනාකරණය 
කළ හැකිය.`,
      `ශ්‍රේණිය 4 සඳහා 
හොඳ පෝෂණය 
මගින් ශක්තිය 
රැකගැනීම 
ඉතා වැදගත්.

✅ හොඳම ආහාර:
- ඉහළ ප්‍රෝටීන් — 
  මාළු, බිත්තර, 
  කුකුල් මස්, 
  පරිප්පු, 
  චීස්, ගෙඩි
- සංකීර්ණ 
  කාබෝහයිඩ්‍රේට් — 
  බත්, ඕට්ස්, 
  බතල
- වර්ණවත් 
  පලතුරු සහ 
  එළවළු
- සෞඛ්‍ය සම්පන්න 
  මේද — 
  පොල් තෙල්, 
  ගෙඩි
- දිනකට 
  වතුර 
  වීදුරු 10ක් 
  පානය කරන්න

❌ සම්පූර්ණයෙන්ම 
   වළකින්න:
- මත්පැන්
- රසායනික 
  ප්‍රතිකාරය 
  අතරතුර 
  අමු ආහාර
- ද්‍රාක්ෂා ඵලය
- ඔක්කාරයක් 
  ඇත්නම් 
  ඉතාම매운 
  ආහාර
- අධික සීනි

🥤 ආහාර ගැනීම 
   ඉතා දුෂ්කර නම්:
- පැය 2කට 
  වරක් 
  කුඩා ප්‍රමාණ
- පෝෂක 
  අතිරේක 
  පාන
- මෘදු ආහාර — 
  කෙසෙල්, 
  දෝ, 
  කැඳ, 
  සුප්
- දිනපතා 
  දියර 
  සිප් සිප් 
  කරන්න

⚠️ ඉතා වැදගත්:
දින 2කට වඩා 
ආහාර ගත 
නොහැකි නම් 
වෛද්‍යවරයාට 
වහාම කියන්න.`,
      `ශ්‍රේණිය 4 රෝග 
විනිශ්චයක් ලැබීම 
කෙනෙකුට 
මුහුණ දිය හැකි 
ඉතා දුෂ්කර 
දේවලින් එකකි.

ඔබේ හැඟීම් — 
ඒවා කුමක් 
වුවත් — 
සම්පූර්ණයෙන්ම 
වලංගු සහ 
මානුෂිකය.

ඔබට දැනිය හැකිය:
- භීතිය හෝ 
  කම්පනය
- කෝපය — 
  ඇයි මට?
- ගැඹුරු දුක 
  හෝ ශෝකය
- ඔබේ පවුල 
  ගැන කනස්සල්ල
- අවිනිශ්චිතතාවය 
  සහ අසරණ දැනීම
- සමහර විට 
  සාමය සහ 
  පිළිගැනීමේ 
  මොහොත්

මේ සියලු 
හැඟීම් සාමාන්‍යයි.
දැනීමට 
නිවැරදි හෝ 
වැරදි ආකාරයක් 
නොමැත.

💙 ඇත්තටම 
   උදව් වන දේ:
- සම්පූර්ණයෙන්ම 
  විශ්වාස කරන 
  කෙනෙකු සමඟ 
  කතා කරන්න
- ඔබේ පවුලට 
  ඔබව ආදරය 
  කිරීමට සහ 
  සහය කිරීමට 
  ඉඩ දෙන්න
- වෘත්තීය 
  උපදේශකයෙකු 
  හෝ 
  මනෝ 
  විද්‍යාඥයෙකු 
  හමුවන්න
- ශ්‍රේණිය 4 
  සහිත 
  අනෙකුත් 
  අය සමඟ 
  සම්බන්ධ වන්න
- ශක්තිය 
  ඇති විට 
  ඔබව 
  සතුටු කරන 
  දේ කරන්න
- ඔබේ 
  හදවතේ 
  ඇති දේ 
  ආදරණීයයන්ට 
  කියන්න

🗣️ ඔබේ 
   වෛද්‍යවරයාට 
   කියන්න:
- ඔබට 
  ඉදිරියට 
  යා නොහැකි 
  දැනෙනවා නම්
- සම්පූර්ණ 
  බලාපොරොත්තු 
  රහිත දැනීම
- ඉතා අඳුරු 
  සිතුවිලි
- ශ්‍රියාත්මකව 
  ක්‍රියා කිරීමට 
  නොහැකි වීම

ඔබේ ජීවිතයට 
අරුතක් සහ 
වටිනාකමක් ඇත.
ඔබේ රැකවරණ 
කණ්ඩායම 
ඔබේ 
ජීවිතයේ 
ගුණාත්මකභාවය 
සම්පූර්ණයෙන්ම 
සහය කිරීමට 
විශ්වාස කරයි.

ඔබ 
තනිව 
නොසිටී.
අපි 
ඔබ 
සමඟ 
සිටිමු. 💙`
    ],
    ta: [
      `உங்கள் மூளையில் "க்ளியோமா" என்ற 
வளர்ச்சி இருப்பதை கண்டுபிடித்துள்ளார்.
தரம் 4 — க்ளியோபிளாஸ்டோமா 
அல்லது GBM என்றும் அழைக்கப்படுகிறது.

தரம் 4 மூளை கட்டிகளில் 
மிகவும் தீவிரமான வகை.
இது குறைந்த தரங்களை விட 
வேகமாக வளர்வதால் 
உடனடியும் வலிமையான 
சிகிச்சை தேவை.

நாங்கள் உங்களிடம் 
நேர்மையாக இருக்கவும் 
நம்பிக்கை தரவும் விரும்புகிறோம்.
தரம் 4 க்ளியோமா உள்ள பலர் 
சிகிச்சையால் நல்ல பலன் பெற்று 
தங்கள் குடும்பத்தினருடன் 
அர்த்தமுள்ள வாழ்க்கையை 
தொடர்கிறார்கள்.

உங்கள் மருத்துவர் கவனமான 
சோதனைக்கு பிறகு இதை உறுதிப்படுத்தி 
உங்களுக்காக சிகிச்சை திட்டம் 
தயார் செய்துள்ளார்.
உங்கள் பராமரிப்பு குழு 
ஒவ்வொரு அடியிலும் 
உங்களை ஆதரிக்க 
முழுமையாக அர்ப்பணித்துள்ளது.`,
      `தரம் 4 க்ளியோமாவுக்கு 
உடனடியும் தீவிரமான 
சிகிச்சை தேவை.
உங்கள் திட்டத்தில் அடங்கும்:

🔪 அறுவை சிகிச்சை
பாதுகாப்பாக முடிந்தவரை 
வளர்ச்சியை அகற்றுவது.
இது முடிந்தவரை விரைவில் 
செய்யப்படுகிறது.

☢️ கதிர்வீச்சு சிகிச்சை
6 வாரங்கள் தினசரி 
கதிர்வீச்சு சிகிச்சை.
ஒவ்வொரு வாரமும் 
மருத்துவமனை போக வேண்டும்.
மீதமுள்ள கட்டி செல்களை 
அழிக்கிறது.

💊 கீமோதெரபி
கதிர்வீச்சு சிகிச்சையின் போதும் 
பிறகும் டெமோசோலோமைட் மாத்திரைகள்.
கதிர்வீச்சின் போது: தினசரி மாத்திரைகள்.
கதிர்வீச்சுக்கு பிறகு: 5 நாட்கள் உண்டு, 
23 நாட்கள் இல்லை என்று சுழற்சி.
பொதுவாக 6 சுழற்சிகள்.

💉 கூடுதல் சிகிச்சைகள்
மருத்துவர் விவாதிக்கலாம்:
பெவாசிசுமாப் (Avastin) ஊசிகள்
கட்டி சிகிச்சை புலங்கள் (TTFields) சாதனம்
கிடைக்கும்போது மருத்துவ பரிசோதனைகள்

உங்கள் சரியான திட்டத்தை 
மருத்துவர் தெளிவாக விளக்குவார்.
எப்போதும் அனைத்து மருந்துகளையும் 
நியமிக்கப்பட்டபடி எடுங்கள்.
ஒவ்வொரு சந்திப்பிற்கும் வாருங்கள் — 
ஒவ்வொன்றும் முக்கியம்.`,
      `🔴 இப்போதே மருத்துவமனைக்கு செல்லுங்கள்:
- வலிப்பு அல்லது உடல் நடுங்குதல்
- திடீரென்று பேச முடியாமல் போவது
- உடலின் ஒரு பக்கம் மிகவும் 
  பலவீனமாவது
- திடீர் மிகவும் கடுமையான தலைவலி
- நனவு இழப்பு
- திடீர் பார்வை இழப்பு
- திடீர் தீவிர குழப்பம்
- குடும்பத்தினரை அடையாளம் 
  காண முடியாமல் போவது

🟡 இன்றே மருத்துவரை அழையுங்கள்:
- தினமும் மோசமாகும் தலைவலி
- இரண்டு முறைக்கும் மேல் வாந்தி
- 38.5°C க்கும் அதிகமான காய்ச்சல்
- மிகவும் குழப்பமான உணர்வு
- பார்வை மங்கலாவது
- நேற்றை விட மிகவும் சோர்வாக உணர்வது
- கைகள் அல்லது கால்களில் 
  புதிய பலவீனம்
- திடீர் மனநிலை அல்லது 
  ஆளுமை மாற்றங்கள்

🟢 சிகிச்சையின் போது இயல்பானவை:
- சோர்வு — மிகவும் இயல்பானது
- மிதமான முதல் மிதமிஞ்சிய குமட்டல்
- முடி உதிர்வு — தற்காலிகமானது
- கீமோதெரபிக்கு பிறகு 
  இடுப்பு அல்லது எலும்பு வலி
- நினைவாற்றல் அல்லது சிந்தனை மாற்றங்கள்
- உணர்ச்சிவசப்படுவது அல்லது 
  சோர்வாக உணர்வது
- அறுவை சிகிச்சை பகுதியில் 
  ஆரம்பத்தில் வீக்கம் — இயல்பானது`,
      `மிகவும் முக்கியமான கேள்விகள்:

- என் சரியான சிகிச்சை திட்டம் என்ன?
- எத்தனை கீமோதெரபி சுழற்சிகள்?
- பெவாசிசுமாப் என்றால் என்ன, 
  எனக்கு தேவையா?
- TTFields என்றால் என்ன, 
  நான் பயன்படுத்த வேண்டுமா?
- எனக்கு மருத்துவ பரிசோதனைகள் 
  கிடைக்குமா?
- என்ன பக்க விளைவுகளை எதிர்பார்க்கலாம்?
- சிகிச்சை வேலை செய்யவில்லை 
  என்றால் என்ன நடக்கும்?
- சிகிச்சையின் போது வேலை செய்யலாமா?
- என் குடும்பத்திற்கு என்ன 
  ஆதரவு கிடைக்கும்?
- அவசரநிலையில் யாரை அழைக்க வேண்டும்?
- தளர்வு பராமரிப்பு என்றால் என்ன?`,
      `தரம் 4 சிகிச்சை அதிக 
பக்க விளைவுகளை ஏற்படுத்தலாம்.
உங்கள் பராமரிப்பு குழு 
அவை அனைத்தையும் 
நிர்வகிக்க உதவும்.

😴 தீவிர சோர்வு
தரம் 4 சிகிச்சையில் 
மிகவும் இயல்பானது.
தேவைப்படும் அளவு ஓய்வெடுங்கள்.
குடும்பத்தினரிடம் உதவி பெறுங்கள்.

🤢 குமட்டல் மற்றும் வாந்தி
மிகவும் சிறிய அளவில் 
அடிக்கடி சாப்பிடுங்கள்.
குளிர்ந்த சாதாரண உணவுகள் 
எளிதாக இருக்கும்.
குமட்டல் எதிர்ப்பு மருந்து 
கிடைக்கும்.

💇 முழு முடி உதிர்வு
கதிர்வீச்சு மற்றும் 
கீமோதெரபியின் போது நடக்கும்.
முற்றிலும் தற்காலிகமானது.
சிகிச்சைக்கு பிறகு முடி 
மீண்டும் வளரும்.

🧠 நினைவாற்றல் மற்றும் 
   அறிவாற்றல் மாற்றங்கள்
குழப்பம், மறதி, கவனம் 
செலுத்துவதில் சிரமம்.
இது இயல்பானது மற்றும் எதிர்பார்க்கப்படுகிறது.
பராமரிப்பு குழுவிடம் சொல்லுங்கள்.

💊 ஸ்டீராய்டு பக்க விளைவுகள்
டெக்ஸாமெதசோன் எடுத்தால்:
குறிப்பாக முகத்தில் எடை அதிகரிப்பு
மனநிலை மாற்றங்கள்
இரத்த சர்க்கரை அதிகரிப்பு
இவை நிர்வகிக்கப்படலாம்.

😔 மிகவும் சோர்வாக உணர்வது
முற்றிலும் புரிந்துகொள்ளத்தக்கது.
தனியாக கஷ்டப்படாதீர்கள்.
ஆலோசனை மற்றும் ஆதரவு 
கிடைக்கும்.`,
      `தரம் 4 க்கு நல்ல ஊட்டச்சத்து 
மூலம் உங்கள் வலிமையை 
பராமரிப்பது மிகவும் முக்கியம்.

✅ சிறந்த உணவுகள்:
- அதிக புரதம் — மீன், முட்டை, 
  கோழி, பருப்பு, பனீர், கொட்டைகள்
- சிக்கலான கார்போஹைட்ரேட் — 
  சோறு, ஓட்ஸ், சர்க்கரைவள்ளிக்கிழங்கு
- வண்ணமயமான பழங்கள் மற்றும் 
  காய்கறிகள்
- ஆரோக்கியமான கொழுப்புகள் — 
  தேங்காய் எண்ணெய், கொட்டைகள்
- தினமும் 10 கிளாஸ் தண்ணீர் குடியுங்கள்

❌ கண்டிப்பாக தவிர்க்க வேண்டியவை:
- மது முற்றிலும்
- கீமோதெரபியின் போது 
  பச்சை அல்லது 
  குறைவாக சமைத்த உணவு
- திராட்சைப்பழம்
- குமட்டல் இருந்தால் 
  மிகவும் காரமான உணவு
- அதிக சர்க்கரை

🥤 சாப்பிடுவது மிகவும் 
   கடினமாக இருந்தால்:
- 2 மணி நேரத்திற்கு ஒரு முறை 
  சிறிய அளவில்
- ஊட்டச்சத்து சப்ளிமெண்ட் பானங்கள்
- மென்மையான உணவுகள் — 
  வாழைப்பழம், தயிர், கஞ்சி, சூப்
- நாள் முழுவதும் தொடர்ந்து 
  திரவங்களை சிப் செய்யுங்கள்

⚠️ மிகவும் முக்கியம்:
2 நாட்களுக்கும் மேல் 
சாப்பிட முடியவில்லை என்றால் 
மருத்துவரிடம் உடனே சொல்லுங்கள்.`,
      `தரம் 4 நோய் கண்டறிதல் பெறுவது`
    ]
  },

  // ── MENINGIOMA GRADE I ──────────────────────────────────────────────
  meningioma_1: {
    meta: {
      name: { en: 'Meningioma Grade I', si: 'මෙනින්ජියෝමා - ශ්‍රේණිය 1', ta: 'மெனின்ஜியோமா - தரம் 1' },
      accent: '#9333ea', accentBg: '#faf5ff', icon: 'M1'
    },
    en: [
      `You have a type of brain growth called 
Meningioma. It is Grade 1 — this is 
the most common and mildest type.

Meningioma grows from the meninges — 
the thin protective layers that 
surround your brain and spinal cord.
It is NOT a brain cancer in most cases.

Grade 1 Meningioma is usually 
very slow growing. Many people 
live completely normal lives 
with Grade 1 Meningioma.

Your doctor found this and has 
a plan to take the best care of you.
You are in very good hands.`,
      `For Grade 1 Meningioma treatment 
depends on size and location.

👁️ WATCH AND WAIT
If the tumor is small and not 
causing symptoms your doctor 
may choose to monitor it with 
regular MRI scans.
This is called active surveillance.
It does not mean ignoring it — 
your doctor is watching carefully.

🔪 SURGERY
If the tumor is larger or causing 
symptoms surgery to remove it 
is the most common treatment.
Grade 1 Meningioma can often 
be completely removed.

☢️ RADIATION THERAPY
If surgery is not possible or 
if any tumor remains after surgery 
radiation may be recommended.

Most Grade 1 Meningioma patients 
do very well after treatment.
Always follow your doctor's plan.`,
      `🔴 GO TO HOSPITAL RIGHT NOW IF:
- Seizure or body shaking
- Sudden severe headache
- Cannot speak suddenly
- One side of body goes weak
- You lose consciousness
- Sudden vision changes

🟡 CALL YOUR DOCTOR TODAY IF:
- Headache getting worse over days
- Vision becoming blurry or double
- Hearing changes in one ear
- Feeling confused or forgetful
- New weakness in arms or legs
- Balance problems when walking

🟢 NORMAL — DO NOT WORRY:
- Mild headache occasionally
- Feeling tired sometimes
- Feeling anxious about diagnosis
  → Talk to your care team`,
      `Good questions to ask:

- Do I need treatment now or 
  watch and wait?
- How often will I have MRI scans?
- What size is my tumor exactly?
- Can it be completely removed?
- What are the surgery risks?
- Will it grow back after removal?
- What activities are safe for me?
- Can I drive and work normally?
- What symptoms should worry me?
- Who do I call if I feel unwell?`,
      `Side effects depend on your 
specific treatment.

AFTER SURGERY:
😴 Tiredness — very common
Rest well. Your brain needs time.

🤕 Headache after surgery
Gets better day by day.
Medicine will be provided.

😟 Feeling emotional
Completely normal after brain surgery.
Talk to someone you trust.

💇 Some hair shaved for surgery
It grows back fully.

IF RADIATION IS GIVEN:
🤢 Mild nausea — manageable
😴 Fatigue — rest when needed
💆 Scalp sensitivity — use gentle products

Most Grade 1 Meningioma patients 
recover very well.
Your care team is always there to help!`,
      `Good food helps your brain and 
body heal after treatment.

✅ GOOD FOODS:
- Rice, bread, roti — gives energy
- Fish, eggs, chicken, lentils — 
  builds strength
- Fruits and vegetables — 
  healing and immunity
- Drink plenty of water daily

❌ AVOID:
- Very spicy or oily food
- Alcohol
- Too much sugar

🥤 IF APPETITE IS LOW:
- Small meals often
- Soft comfortable foods
- Coconut water or plain water

No special diet is required 
for Meningioma Grade 1.
Just eat well and stay hydrated.
Ask your doctor if you have 
specific concerns.`,
      `Even a Grade 1 diagnosis can feel 
very scary and overwhelming.
Your feelings are completely valid.

It is okay to feel:
- Worried or anxious
- Relieved it is Grade 1 
  but still scared
- Confused about what happens next
- Emotional and unsettled

💙 THINGS THAT HELP:
- Talk openly with family 
  or a trusted friend
- Ask your doctor all your questions — 
  no question is too small
- Do the activities you enjoy 
  when you feel able
- Rest without guilt
- Remember — Grade 1 has 
  very good outcomes

🗣️ TELL YOUR DOCTOR IF:
- You feel very anxious every day
- You cannot sleep from worry
- You feel hopeless or very sad
- You need someone to talk to

Your care team genuinely cares 
about your emotional wellbeing 
as much as your physical health.
You are going to be okay. 💙`
    ],
    si: [
      `ඔබේ මොළයේ "මෙනින්ජියෝමා" නම් 
වර්ධනයක් ඇති බව සොයාගෙන ඇත.
ශ්‍රේණිය 1 — මෙය වඩාත් සාමාන්‍ය 
සහ මෘදුතම වර්ගයයි.

මෙනින්ජියෝමා වර්ධනය වන්නේ 
මෙනින්ජීස් වලින් — ඔබේ 
මොළය සහ කොඳු ඇට පෙළ 
වට කරන얇은 ආරක්ෂිත 
ස්ථරවලින්.
බොහෝ අවස්ථාවල එය 
මොළ පිළිකාවක් නොවේ.

ශ්‍රේණිය 1 මෙනින්ජියෝමා 
සාමාන්‍යයෙන් ඉතා සෙමින් 
වැඩෙයි. ශ්‍රේණිය 1 
මෙනින්ජියෝමා සහිත 
බොහෝ අය සම්පූර්ණයෙන්ම 
සාමාන්‍ය ජීවිතයක් ගත කරයි.

ඔබේ වෛද්‍යවරයා මෙය 
සොයාගෙන ඔබව හොඳින් 
රැකගැනීමට සැලැස්මක් 
සකස් කර ඇත.
ඔබ ඉතා හොඳ 
අතේ සිටී.`,
      `ශ්‍රේණිය 1 මෙනින්ජියෝමාට 
ප්‍රතිකාරය ප්‍රමාණය සහ 
පිහිටීම අනුව වෙනස් වේ.

👁️ නිරීක්ෂණය
ගෙඩිය කුඩා නම් සහ 
රෝග ලක්ෂණ ඇති 
නොකරන්නේ නම් 
ඔබේ වෛද්‍යවරයා 
නිතිපතා MRI 
පරීක්ෂා සමඟ 
නිරීක්ෂණය කිරීමට 
තෝරා ගත හැකිය.
මෙය නොසලකා 
හැරීම නොවේ — 
ඔබේ වෛද්‍යවරයා 
සූක්ෂ්මව 
බලා සිටී.

🔪 ශල්‍යකර්මය
ගෙඩිය විශාල නම් 
හෝ රෝග ලක්ෂණ 
ඇති කරන්නේ නම් 
ශල්‍යකර්මය 
බොහෝ විට 
ප්‍රතිකාරයේ 
පළමු පියවරයි.
ශ්‍රේණිය 1 
මෙනින්ජියෝමා 
බොහෝ විට 
සම්පූර්ණයෙන්ම 
ඉවත් කළ හැකිය.

☢️ විකිරණ ප්‍රතිකාරය
ශල්‍යකර්මය 
කළ නොහැකි නම් 
හෝ ශල්‍යකර්මයෙන් 
පසු ගෙඩියෙන් 
කොටසක් ඉතිරි 
නම් විකිරණ 
යෝජනා කළ හැකිය.

ශ්‍රේණිය 1 
මෙනින්ජියෝමා 
රෝගීන් 
බොහෝ දෙනා 
ප්‍රතිකාරයෙන් 
පසු ඉතා 
හොඳින් සිටිති.`,
      `🔴 දැන්ම රෝහලට යන්න:
- ආයාසය හෝ 
  ශරීරය කම්පා වීම
- හදිසි දරුණු හිසරදය
- හදිසියේ කතා කිරීමට 
  නොහැකි වීම
- ශරීරයේ එක් පැත්තක් 
  දුර්වල වීම
- ඥානය නැතිවීම
- හදිසි දෘෂ්ටි 
  වෙනස්කම්

🟡 අද වෛද්‍යවරයාට 
   කතා කරන්න:
- දිනවලින් 
  නරක් වන හිසරදය
- දෑස් 
  අපැහැදිලි වීම 
  හෝ ද්විත්ව දෘෂ්ටිය
- එක් කනකින් 
  ශ්‍රවණ 
  වෙනස්කම්
- ව්‍යාකූල 
  හෝ අමතක දැනීම
- අත් කකුල් 
  නව දුර්වලතාවය
- ඇවිදීමේදී 
  සමතුලිතතා 
  ගැටළු

🟢 සාමාන්‍ය — 
   බය නොවන්න:
- සාමාන්‍ය 
  සුළු හිසරදය
- සමහර විට 
  තෙහෙට්ටුව
- රෝග විනිශ්චය 
  ගැන කනස්සල්ල
  → ඔබේ රැකවරණ 
    කණ්ඩායමට කියන්න`,
      `අහන්න
හොඳ ප්‍රශ්න:

- දැන් ප්‍රතිකාරය 
  අවශ්‍යද හෝ 
  නිරීක්ෂණය 
  කළ යුතුද?
- MRI පරීක්ෂා 
  කොපමණ 
  කාලයකට 
  වරක්ද?
- මගේ ගෙඩිය 
  හරියටම 
  කොතරම් 
  විශාලද?
- සම්පූර්ණයෙන්ම 
  ඉවත් කළ 
  හැකිද?
- ශල්‍යකර්මයේ 
  අවදානම් 
  මොනවාද?
- ඉවත් කිරීමෙන් 
  පසු නැවත 
  වර්ධනය 
  වේද?
- කුමන 
  ක්‍රියාකාරකම් 
  ආරක්ෂිතද?
- රිය 
  පැදවිය 
  හැකිද?
- කුමන 
  ලකුණු 
  කනස්සල්ලට 
  හේතු 
  වේද?`,
      `බලපෑම්
අතුරු ආබාධ ඔබේ 
ප්‍රතිකාරය 
අනුව වෙනස් වේ.

ශල්‍යකර්මයෙන් පසු:
😴 තෙහෙට්ටුව — 
   ඉතාම සාමාන්‍යයි
හොඳින් 
විවේකය ගන්න.
ඔබේ මොළයට 
කාලය 
අවශ්‍යයි.

🤕 ශල්‍යකර්මයෙන් 
   පසු හිසරදය
දිනෙන් දින 
හොඳ වේ.
ඖෂධ 
ලබා දෙනු ඇත.

😟 චිත්තවේගීය 
   දැනීම
මොළ 
ශල්‍යකර්මයෙන් 
පසු 
සම්පූර්ණයෙන්ම 
සාමාන්‍යයි.

💇 ශල්‍යකර්මය 
   සඳහා 
   සමහර 
   හිස කෙස් 
   කපා ඇත
සම්පූර්ණයෙන්ම 
නැවත 
වැඩෙනු ඇත.

ශ්‍රේණිය 1 
මෙනින්ජියෝමා 
රෝගීන් 
බොහෝ දෙනා 
ඉතා හොඳින් 
සුව වෙති!`,
      `හොඳ ආහාර 
ප්‍රතිකාරයෙන් 
පසු ඔබේ 
මොළය සහ 
ශරීරය 
සුව වීමට 
උදව් කරයි.

✅ හොඳ ආහාර:
- බත්, පාන්, 
  රොටී — 
  ශක්තිය ලබාදේ
- මාළු, බිත්තර, 
  කුකුල් මස්, 
  පරිප්පු — 
  ශක්තිය 
  ගොඩනඟයි
- පලතුරු සහ 
  එළවළු — 
  සුව කිරීම
- දිනකට 
  ජලය 
  ප්‍රමාණවත් 
  ලෙස 
  පානය කරන්න

❌ වළකින්න:
- ඉතාම매운 
  හෝ 
  තෙල් 
  සහිත ආහාර
- මත්පැන්
- අධික සීනි

ශ්‍රේණිය 1 
මෙනින්ජියෝමා 
සඳහා 
විශේෂ 
ආහාරයක් 
අවශ්‍ය නොවේ.
හොඳින් 
ආහාර ගෙන 
ජලය 
බොන්න.`,
      `ශ්‍රේණිය 1 
රෝග 
විනිශ්චයක් 
ලැබීම 
පවා ඉතා 
භයකරු සහ 
ගිලෙනා 
දැනිය හැකිය.
ඔබේ 
හැඟීම් 
සම්පූර්ණයෙන්ම 
වලංගුයි.

දැනීමට 
ඉඩ 
ඇත:
- කනස්සල්ල 
  හෝ 
  බිය
- ශ්‍රේණිය 1 
  බව 
  ලිහිල් 
  දැනීමත් 
  තවමත් 
  බිය
- ඊළඟ 
  සිදු 
  වන දේ 
  ගැන 
  ව්‍යාකූලතාවය
- චිත්තවේගීය 
  දැනීම

💙 උදව් 
   වන දේ:
- පවුල 
  හෝ 
  විශ්වාසනීය 
  මිතුරෙකු 
  සමඟ 
  විවෘතව 
  කතා කරන්න
- ඔබේ 
  සියලු 
  ප්‍රශ්න 
  වෛද්‍යවරයාගෙන් 
  අහන්න
- ශ්‍රේණිය 1 
  ඉතා 
  හොඳ 
  ප්‍රතිඵල 
  ඇති බව 
  මතක 
  තබා ගන්න

ඔබේ 
රැකවරණ 
කණ්ඩායම 
ඔබව 
රැකගනී. 💙`
    ],
    ta: [
      `உங்கள் மூளையில் "மெனின்ஜியோமா" 
என்ற வளர்ச்சி இருப்பதை 
கண்டுபிடித்துள்ளார்.
தரம் 1 — இது மிகவும் பொதுவான 
மற்றும் மிகவும் மென்மையான வகை.

மெனின்ஜியோமா வளர்வது 
மெனின்ஜீஸ் என்ற இடத்திலிருந்து — 
உங்கள் மூளை மற்றும் 
முள்ளந்தண்டை சுற்றியுள்ள 
மெல்லிய பாதுகாப்பு அடுக்குகளிலிருந்து.
பெரும்பாலான சந்தர்ப்பங்களில் 
இது மூளை புற்றுநோய் அல்ல.

தரம் 1 மெனின்ஜியோமா பொதுவாக 
மிகவும் மெதுவாக வளர்கிறது.
தரம் 1 மெனின்ஜியோமா உள்ள 
பலர் முற்றிலும் இயல்பான 
வாழ்க்கை வாழ்கிறார்கள்.

உங்கள் மருத்துவர் இதை கண்டுபிடித்து 
உங்களை சிறப்பாக கவனிக்க 
திட்டம் தயார் செய்துள்ளார்.
நீங்கள் மிகவும் நல்ல 
கைகளில் இருக்கிறீர்கள்.`,
      `தரம் 1 மெனின்ஜியோமாவுக்கு 
சிகிச்சை அளவு மற்றும் 
இடத்தைப் பொறுத்து மாறுபடும்.

👁️ கவனிப்பு மற்றும் காத்திருப்பு
கட்டி சிறியதாக இருந்தால் 
மற்றும் அறிகுறிகளை 
ஏற்படுத்தவில்லை என்றால் 
மருத்துவர் வழக்கமான MRI 
பரிசோதனைகளுடன் கண்காணிக்க 
தேர்வு செய்யலாம்.
இது புறக்கணிப்பது அல்ல — 
மருத்துவர் கவனமாக 
கவனித்துக்கொண்டிருக்கிறார்.

🔪 அறுவை சிகிச்சை
கட்டி பெரியதாக இருந்தால் 
அல்லது அறிகுறிகளை ஏற்படுத்தினால் 
அறுவை சிகிச்சை பொதுவான சிகிச்சை.
தரம் 1 மெனின்ஜியோமாவை 
பெரும்பாலும் முழுவதுமாக 
அகற்றலாம்.

☢️ கதிர்வீச்சு சிகிச்சை
அறுவை சிகிச்சை சாத்தியமில்லை 
என்றால் அல்லது அறுவை சிகிச்சைக்கு 
பிறகு கட்டி மிச்சமிருந்தால் 
கதிர்வீச்சு பரிந்துரைக்கப்படலாம்.

பெரும்பாலான தரம் 1 
மெனின்ஜியோமா நோயாளிகள் 
சிகிச்சைக்கு பிறகு மிகவும் 
நன்றாக இருக்கிறார்கள்.`,
      `🔴 இப்போதே மருத்துவமனைக்கு செல்லுங்கள்:
- வலிப்பு அல்லது உடல் நடுங்குதல்
- திடீர் கடுமையான தலைவலி
- திடீரென்று பேச முடியாமல் போவது
- உடலின் ஒரு பக்கம் பலவீனமாவது
- நனவு இழப்பு
- திடீர் பார்வை மாற்றங்கள்

🟡 இன்றே மருத்துவரை அழையுங்கள்:
- நாட்களாக மோசமாகும் தலைவலி
- பார்வை மங்கலாவது அல்லது 
  இரட்டை பார்வை
- ஒரு காதில் கேட்கும் திறன் மாற்றம்
- குழப்பம் அல்லது மறதி
- கைகள் கால்களில் புதிய பலவீனம்
- நடக்கும்போது சமநிலை இழப்பு

🟢 இயல்பானவை — பயப்பட வேண்டாம்:
- அவ்வப்போது மிதமான தலைவலி
- சில நேரங்களில் சோர்வு
- நோய் கண்டறிதலைப் பற்றிய கவலை
  → உங்கள் பராமரிப்பு குழுவிடம் சொல்லுங்கள்`,
      `நல்ல கேள்விகள்:

- இப்போது சிகிச்சை தேவையா 
  அல்லது கவனிப்பு மற்றும் 
  காத்திருப்பா?
- எத்தனை காலத்திற்கு ஒரு முறை 
  MRI பரிசோதனை செய்ய வேண்டும்?
- என் கட்டி சரியாக எவ்வளவு பெரியது?
- முழுவதுமாக அகற்றலாமா?
- அறுவை சிகிச்சையின் அபாயங்கள் என்ன?
- அகற்றிய பிறகு மீண்டும் வளருமா?
- என்ன செயல்கள் பாதுகாப்பானவை?
- வாகனம் ஓட்டலாமா, வேலைக்கு போகலாமா?
- என்ன அறிகுறிகள் என்னை கவலைப்படுத்த வேண்டும்?`,
      `பக்க விளைவுகள் உங்கள் 
சிகிச்சையைப் பொறுத்து மாறுபடும்.

அறுவை சிகிச்சைக்கு பிறகு:
😴 சோர்வு — மிகவும் இயல்பானது
நன்றாக ஓய்வெடுங்கள்.
உங்கள் மூளைக்கு நேரம் தேவை.

🤕 அறுவை சிகிச்சைக்கு பிறகு தலைவலி
நாளுக்கு நாள் குணமாகும்.
மருந்து தரப்படும்.

😟 உணர்ச்சிவசப்படுவது
மூளை அறுவை சிகிச்சைக்கு 
பிறகு முற்றிலும் இயல்பானது.
நம்பகமான யாரிடமாவது பேசுங்கள்.

💇 அறுவை சிகிச்சைக்காக 
   சிறிது முடி கத்தரிக்கப்படும்
முழுவதுமாக மீண்டும் வளரும்.

தரம் 1 மெனின்ஜியோமா நோயாளிகள் 
பெரும்பாலும் மிகவும் நன்றாக 
குணமடைகிறார்கள்!`,
      `நல்ல உணவு சிகிச்சைக்கு பிறகு 
உங்கள் மூளை மற்றும் 
உடல் குணமடைய உதவுகிறது.

✅ நல்ல உணவுகள்:
- சோறு, ரொட்டி, சப்பாத்தி — 
  ஆற்றல் தருகிறது
- மீன், முட்டை, கோழி, பருப்பு — 
  வலிமை கொடுக்கிறது
- பழங்கள் மற்றும் காய்கறிகள் — 
  குணமடைதல் மற்றும் நோய் எதிர்ப்பு சக்தி
- தினமும் போதுமான தண்ணீர் குடியுங்கள்

❌ தவிர்க்க வேண்டியவை:
- மிகவும் காரமான அல்லது எண்ணெய் உணவுகள்
- மது
- அதிக சர்க்கரை

தரம் 1 மெனின்ஜியோமாவுக்கு 
சிறப்பு உணவு தேவையில்லை.
நன்றாக சாப்பிட்டு தண்ணீர் குடியுங்கள்.`,
      `தரம் 1 நோய் கண்டறிதல் கூட`
    ]
  },

  // ── MENINGIOMA GRADE II ──────────────────────────────────────────────
  meningioma_2: {
    meta: {
      name: { en: 'Meningioma Grade II', si: 'මෙනින්ජියෝමා - ශ්‍රේණිය 2', ta: 'மெனின்ஜியோமா - தரம் 2' },
      accent: '#7e22ce', accentBg: '#faf5ff', icon: 'M2'
    },
    en: [
      `You have a type of brain growth called 
Meningioma. It is Grade 2 — also called 
Atypical Meningioma.

Grade 2 grows faster than Grade 1 
and has a higher chance of coming 
back after treatment. It needs more 
active treatment and closer monitoring.

This does not mean the situation 
is hopeless. Many people with 
Grade 2 Meningioma respond well 
to treatment and continue to 
live meaningful lives.

Your doctor has confirmed this 
after careful testing and has 
prepared a treatment plan for you.
Your care team is fully with you.`,
      `Grade 2 Meningioma needs more 
active treatment than Grade 1.

🔪 SURGERY
Surgery to remove as much of 
the tumor as safely possible.
This is usually the first step.
Complete removal is the goal 
but may not always be possible 
depending on location.

☢️ RADIATION THERAPY
After surgery radiation is 
usually recommended even if 
the tumor was fully removed.
This reduces the chance of 
it coming back.
Radiation may be given as:
Standard radiation over several weeks
OR Stereotactic radiosurgery 
in fewer sessions

Your doctor will decide 
the best approach for you.
Always attend all appointments.
Never miss radiation sessions.`,
      `🔴 GO TO HOSPITAL RIGHT NOW IF:
- Seizure or body shaking
- Sudden severe headache
- Cannot speak suddenly
- One side of body goes weak
- You lose consciousness
- Sudden vision changes
- Sudden extreme confusion

🟡 CALL YOUR DOCTOR TODAY IF:
- Headache getting worse over days
- Vision becoming blurry or double
- New weakness in arms or legs
- Feeling very confused or forgetful
- Balance problems when walking
- Hearing changes in one ear
- Fever after surgery

🟢 NORMAL DURING RECOVERY:
- Tiredness after surgery or radiation
- Mild headache
- Feeling emotional
- Hair loss if radiation given
  → Temporary, grows back`,
      `Important questions to ask:

- Was the tumor fully removed?
- Why is radiation recommended?
- How many radiation sessions?
- How often will I have MRI scans?
- What is the chance of it coming back?
- What happens if it comes back?
- Can I work during treatment?
- What activities should I avoid?
- What side effects should I expect?
- Who do I call in an emergency?
- Are there clinical trials available?`,
      `AFTER SURGERY:
😴 Tiredness — very common
Rest well. Your brain needs healing time.

🤕 Headache after surgery
Gradually gets better.
Medicine will be provided.

😟 Feeling emotional or anxious
Completely normal.
Talk to your care team.

AFTER RADIATION:
😴 Fatigue — can be significant
Rest when needed.
Gentle activity helps recovery.

🤢 Mild nausea
Eat small meals often.

💆 Scalp sensitivity and hair loss
Use gentle hair products.
Hair grows back after treatment.

🧠 Memory or thinking changes
May feel foggy temporarily.
This usually improves.
Tell your doctor if it bothers you.

Your care team will help you 
manage every side effect. 
You do not have to manage alone.`,
      `Good nutrition supports recovery 
and keeps your strength up 
during treatment.

✅ GOOD FOODS:
- Rice, bread, roti — steady energy
- Fish, eggs, chicken, lentils — 
  protein for strength and healing
- Fruits and vegetables — 
  immunity and recovery
- Dairy products — milk, curd
- Drink 8 to 10 glasses of 
  water daily

❌ AVOID:
- Alcohol completely
- Very spicy or oily food
- Raw food during radiation
- Too much sugar

🥤 IF APPETITE IS LOW:
- Small frequent meals
- Soft comfortable foods
- Protein drinks if needed
- Stay well hydrated

Ask your doctor to arrange 
a dietitian if you have 
ongoing nutrition concerns.`,
      `Grade 2 diagnosis brings more 
worry than Grade 1 because of 
the higher chance of recurrence.
These worries are completely valid.

You may feel:
- More anxious than before
- Worried about it coming back
- Frustrated with ongoing treatment
- Uncertain about the future
- Sometimes moments of acceptance

💙 THINGS THAT HELP:
- Talk openly with family 
  and your care team
- Ask all your questions — 
  knowledge reduces fear
- Connect with others who 
  have had Meningioma
- Focus on what you can control — 
  attending appointments, 
  eating well, resting
- Find activities that bring 
  you peace and joy

🗣️ TELL YOUR DOCTOR IF:
- Anxiety is affecting your 
  daily life
- You cannot sleep from worry
- You feel very sad for many days
- You need professional support

Mental health support is 
available and it makes 
a real difference.
Asking for help is wise 
and brave.

Your care team is committed 
to your complete wellbeing. 💙`
    ],
    si: [
      `ඔබේ මොළයේ "මෙනින්ජියෝමා" නම් 
වර්ධනයක් ඇති බව සොයාගෙන ඇත.
ශ්‍රේණිය 2 — අටිපිකල් 
මෙනින්ජියෝමා ලෙසද හැඳින්වේ.

ශ්‍රේණිය 2 ශ්‍රේණිය 1 ට වඩා 
ශීඝ්‍රයෙන් වැඩෙන නිසා 
ප්‍රතිකාරයෙන් පසු නැවත 
ඒමේ වැඩි ඉඩකඩක් ඇත.
එය වඩා ක්‍රියාශීලී ප්‍රතිකාරයක් 
සහ සමීප නිරීක්ෂණයක් 
අවශ්‍ය කරයි.

මෙය බලාපොරොත්තු 
රහිත බව අදහස් නොකෙරේ.
ශ්‍රේණිය 2 මෙනින්ජියෝමා 
සහිත බොහෝ අය ප්‍රතිකාරයට 
හොඳ ප්‍රතිචාර දක්වා 
අර්ථවත් ජීවිතයක් 
ගත කිරීම දිගටම 
කරගෙන යයි.

ඔබේ වෛද්‍යවරයා සූක්ෂ්ම 
පරීක්ෂාවෙන් පසු මෙය 
තහවුරු කර ඔබ සඳහා 
ප්‍රතිකාර සැලැස්මක් 
සකස් කර ඇත.
ඔබේ රැකවරණ කණ්ඩායම 
සම්පූර්ණයෙන්ම 
ඔබ සමඟ සිටී.`,
      `ශ්‍රේණිය 2 මෙනින්ජියෝමාට 
ශ්‍රේණිය 1 ට වඩා 
ක්‍රියාශීලී ප්‍රතිකාරයක් 
අවශ්‍ය වේ.

🔪 ශල්‍යකර්මය
හැකිතාක් ආරක්ෂිතව 
ගෙඩිය ඉවත් කිරීම.
මෙය සාමාන්‍යයෙන් 
පළමු පියවරයි.
සම්පූර්ණ ඉවත් කිරීම 
ඉලක්කය වුවත් 
පිහිටීම අනුව 
සෑම විටම 
සාධ්‍ය නොවිය හැක.

☢️ විකිරණ ප්‍රතිකාරය
ගෙඩිය සම්පූර්ණයෙන්ම 
ඉවත් කළත් ශල්‍යකර්මයෙන් 
පසු විකිරණ 
සාමාන්‍යයෙන් 
නිර්දේශ කෙරේ.
මෙය නැවත ඒමේ 
ඉඩකඩ අඩු කරයි.

ඔබේ වෛද්‍යවරයා 
ඔබ සඳහා 
හොඳම ප්‍රවේශය 
තීරණය කරනු ඇත.
සෑම හමුවකටම 
සෑම විටම 
පැමිණෙන්න.
විකිරණ සැසි 
කිසිසේත් 
මඟ නොහරින්න.`,
      `🔴 දැන්ම රෝහලට යන්න:
- ආයාසය හෝ 
  ශරීරය කම්පා වීම
- හදිසි දරුණු හිසරදය
- හදිසියේ කතා කිරීමට 
  නොහැකි වීම
- ශරීරයේ එක් පැත්තක් 
  දුර්වල වීම
- ඥානය නැතිවීම
- හදිසි දෘෂ්ටි වෙනස්කම්
- හදිසි දරුණු ව්‍යාකූලතාවය

🟡 අද වෛද්‍යවරයාට 
   කතා කරන්න:
- දිනවලින් 
  නරක් වන හිසරදය
- දෑස් අපැහැදිලි 
  වීම හෝ 
  ද්විත්ව දෘෂ්ටිය
- අත් කකුල්වල 
  නව දුර්වලතාවය
- ඉතා ව්‍යාකූල 
  හෝ අමතක දැනීම
- ශල්‍යකර්මයෙන් 
  පසු උෂ්ණත්වය

🟢 සුව වීම 
   අතරතුර සාමාන්‍ය:
- ශල්‍යකර්මය හෝ 
  විකිරණයෙන් 
  පසු තෙහෙට්ටුව
- මෘදු හිසරදය
- චිත්තවේගීය දැනීම
- විකිරණ ලබා 
  ගත්නේ නම් 
  හිස කෙස් හැලීම
  → තාවකාලිකයි, 
    නැවත වැඩෙනු ඇත`,
      `අහන්න
වැදගත් ප්‍රශ්න:

- ගෙඩිය සම්පූර්ණයෙන්ම 
  ඉවත් කෙරුණාද?
- විකිරණ ප්‍රතිකාරය 
  ඇයි නිර්දේශ කෙරෙන්නේ?
- විකිරණ සැසි 
  කීයක් ගතවේද?
- MRI පරීක්ෂා 
  කොපමණ 
  කාලයකට 
  වරක්ද?
- නැවත ඒමේ 
  ඉඩකඩ 
  කොතරම්ද?
- නැවත ආවොත් 
  කුමක් 
  සිදු වේද?
- ප්‍රතිකාර 
  අතරතුර 
  රැකියාව 
  කළ හැකිද?
- කුමන 
  ක්‍රියාකාරකම් 
  වළකින්න 
  ඕනේද?
- සායනික 
  පරීක්ෂණ 
  ලැබිය 
  හැකිද?`,
      `බලපෑම්
ශල්‍යකර්මයෙන් පසු:
😴 තෙහෙට්ටුව — 
   ඉතාම සාමාන්‍යයි
හොඳින් 
විවේකය ගන්න.

🤕 ශල්‍යකර්මයෙන් 
   පසු හිසරදය
ක්‍රමයෙන් 
හොඳ වේ.

😟 චිත්තවේගීය 
   හෝ කනස්සල්ල
සාමාන්‍යයි.
රැකවරණ 
කණ්ඩායමට 
කියන්න.

විකිරණ 
ප්‍රතිකාරයෙන් 
පසු:
😴 ශ්‍රාන්තිය — 
   සැලකිය 
   යුතු විය 
   හැකිය
අවශ්‍ය 
විට 
විවේකය 
ගන්න.

🤢 මෘදු ඔක්කාරය
කෙටි ආහාර 
නිතර ගන්න.

💆 හිස් සම 
   සංවේදීතාව 
   සහ 
   හිස කෙස් 
   හැලීම
ප්‍රතිකාරයෙන් 
පසු 
හිස කෙස් 
නැවත 
වැඩෙනු ඇත.

🧠 මතකය 
   හෝ 
   සිතීමේ 
   වෙනස්කම්
තාවකාලිකව 
ව්‍යාකූල 
දැනිය හැක.
සාමාන්‍යයෙන් 
හොඳ වේ.

ඔබේ 
රැකවරණ 
කණ්ඩායම 
සෑම 
අතුරු 
ආබාධයක්ම 
කළමනාකරණය 
කිරීමට 
උදව් 
කරනු ඇත.`,
      `හොඳ පෝෂණය 
සුව වීමට 
සහ ප්‍රතිකාරය 
අතරතුර 
ශක්තිය 
රැකගැනීමට 
සහය වේ.

✅ හොඳ ආහාර:
- බත්, පාන්, 
  රොටී — 
  ස්ථාවර ශක්තිය
- මාළු, බිත්තර, 
  කුකුල් මස්, 
  පරිප්පු — 
  ශක්තිය සහ 
  සුව කිරීම
- පලතුරු සහ 
  එළවළු — 
  ප්‍රතිශක්තිය
- කිරි නිෂ්පාදන
- දිනකට 
  වතුර 
  වීදුරු 
  8-10ක්

❌ වළකින්න:
- මත්පැන් 
  සම්පූර්ණයෙන්ම
- ඉතාම매운 
  ආහාර
- විකිරණ 
  අතරතුර 
  අමු ආහාර
- අධික සීනි

ඔබට 
දිගු 
කාලීන 
පෝෂණ 
ගැටළු 
ඇත්නම් 
ආහාරවේදියෙකු 
ලැබීමට 
ඔබේ 
වෛද්‍යවරයාගෙන් 
ඉල්ලන්න.`,
      `ශ්‍රේණිය 2 රෝග 
විනිශ්චය 
නැවත ඒමේ 
වැඩි ඉඩකඩ 
නිසා 
ශ්‍රේණිය 1 ට 
වඩා 
වැඩි 
කනස්සල්ලක් 
ගෙනෙයි.
මෙම 
කනස්සල්ල 
සම්පූර්ණයෙන්ම 
වලංගුයි.

ඔබට 
දැනිය හැකිය:
- පෙරටත් 
  වඩා 
  කනස්සල්ල
- නැවත 
  ඒම 
  ගැන 
  කනස්සල්ල
- දිගු 
  ප්‍රතිකාරය 
  ගැන 
  කලකිරීම
- අනාගතය 
  ගැන 
  අවිනිශ්චිතතාවය

💙 උදව් 
   වන දේ:
- පවුල සහ 
  රැකවරණ 
  කණ්ඩායම 
  සමඟ 
  විවෘතව 
  කතා කරන්න
- ඔබේ 
  සියලු 
  ප්‍රශ්න 
  අහන්න — 
  දැනුම 
  භීතිය 
  අඩු කරයි
- ඔබට 
  පාලනය 
  කළ හැකි 
  දේ කෙරෙහි 
  අවධානය 
  යොමු කරන්න
- ශාන්තිය 
  සහ 
  සතුට 
  ගෙනෙන 
  ක්‍රියාකාරකම් 
  සොයා ගන්න

🗣️ ඔබේ 
   වෛද්‍යවරයාට 
   කියන්න:
- කනස්සල්ල 
  ඔබේ 
  දෛනික 
  ජීවිතයට 
  බලපාන 
  නම්
- කනස්සල්ලෙන් 
  නිදා 
  ගත 
  නොහැකි 
  නම්
- දිගු 
  දිනවල 
  ඉතා 
  දුකක් 
  දැනෙනවා 
  නම්

ඔබේ 
රැකවරණ 
කණ්ඩායම 
ඔබේ 
සම්පූර්ණ 
යහපැවැත්ම 
සඳහා 
කැපවී 
සිටී. 💙`
    ],
    ta: [
      `உங்கள் மூளையில் "மெனின்ஜியோமா" 
என்ற வளர்ச்சி இருப்பதை 
கண்டுபிடித்துள்ளார்.
தரம் 2 — அடிப்படையற்ற 
மெனின்ஜியோமா என்றும் அழைக்கப்படுகிறது.

தரம் 2 தரம் 1 ஐ விட வேகமாக 
வளர்வதால் சிகிச்சைக்கு பிறகு 
மீண்டும் வருவதற்கான அதிக 
வாய்ப்பு உள்ளது.
இது மிகவும் தீவிரமான சிகிச்சை 
மற்றும் நெருக்கமான கண்காணிப்பு 
தேவைப்படுகிறது.

இது நம்பிக்கையற்ற நிலை 
என்று அர்த்தமில்லை.
தரம் 2 மெனின்ஜியோமா உள்ள 
பலர் சிகிச்சையால் நல்ல பலன் 
பெற்று அர்த்தமுள்ள வாழ்க்கையை 
தொடர்கிறார்கள்.

உங்கள் மருத்துவர் கவனமான 
சோதனைக்கு பிறகு இதை உறுதிப்படுத்தி 
உங்களுக்காக சிகிச்சை திட்டம் 
தயார் செய்துள்ளார்.
உங்கள் பராமரிப்பு குழு 
முழுமையாக உங்களுடன் இருக்கிறது.`,
      `தரம் 2 மெனின்ஜியோமாவுக்கு 
தரம் 1 ஐ விட மிகவும் 
தீவிரமான சிகிச்சை தேவை.

🔪 அறுவை சிகிச்சை
பாதுகாப்பாக முடிந்தவரை 
கட்டியை அகற்றுவது.
இது பொதுவாக முதல் படியாகும்.
முழுமையான அகற்றல் இலக்கு 
ஆனால் இடத்தைப் பொறுத்து 
எப்போதும் சாத்தியமில்லை.

☢️ கதிர்வீச்சு சிகிச்சை
கட்டி முழுமையாக அகற்றப்பட்டாலும் 
அறுவை சிகிச்சைக்கு பிறகு 
கதிர்வீச்சு பொதுவாக பரிந்துரைக்கப்படுகிறது.
இது மீண்டும் வரும் வாய்ப்பை 
குறைக்கிறது.

உங்கள் மருத்துவர் உங்களுக்கு 
சிறந்த அணுகுமுறையை 
தீர்மானிப்பார்.
எப்போதும் அனைத்து 
சந்திப்புகளுக்கும் வாருங்கள்.
கதிர்வீச்சு அமர்வுகளை 
தவிர்க்காதீர்கள்.`,
      `🔴 இப்போதே மருத்துவமனைக்கு செல்லுங்கள்:
- வலிப்பு அல்லது உடல் நடுங்குதல்
- திடீர் கடுமையான தலைவலி
- திடீரென்று பேச முடியாமல் போவது
- உடலின் ஒரு பக்கம் பலவீனமாவது
- நனவு இழப்பு
- திடீர் பார்வை மாற்றங்கள்
- திடீர் தீவிர குழப்பம்

🟡 இன்றே மருத்துவரை அழையுங்கள்:
- நாட்களாக மோசமாகும் தலைவலி
- பார்வை மங்கலாவது அல்லது 
  இரட்டை பார்வை
- கைகள் கால்களில் புதிய பலவீனம்
- மிகவும் குழப்பம் அல்லது மறதி
- அறுவை சிகிச்சைக்கு பிறகு காய்ச்சல்

🟢 குணமடையும் போது இயல்பானவை:
- அறுவை சிகிச்சை அல்லது 
  கதிர்வீச்சுக்கு பிறகு சோர்வு
- மிதமான தலைவலி
- உணர்ச்சிவசப்படுவது
- கதிர்வீச்சு தரப்பட்டால் முடி உதிர்வு
  → தற்காலிகமானது, மீண்டும் வளரும்`,
      `முக்கியமான கேள்விகள்:

- கட்டி முழுமையாக அகற்றப்பட்டதா?
- கதிர்வீச்சு சிகிச்சை ஏன் பரிந்துரைக்கப்படுகிறது?
- எத்தனை கதிர்வீச்சு அமர்வுகள்?
- எத்தனை காலத்திற்கு ஒரு முறை 
  MRI பரிசோதனை செய்ய வேண்டும்?
- மீண்டும் வரும் வாய்ப்பு எவ்வளவு?
- மீண்டும் வந்தால் என்ன நடக்கும்?
- சிகிச்சையின் போது வேலை செய்யலாமா?
- என்ன செயல்களை தவிர்க்க வேண்டும்?
- மருத்துவ பரிசோதனைகள் கிடைக்குமா?`,
      `அறுவை சிகிச்சைக்கு பிறகு:
😴 சோர்வு — மிகவும் இயல்பானது
நன்றாக ஓய்வெடுங்கள்.

🤕 அறுவை சிகிச்சைக்கு பிறகு தலைவலி
படிப்படியாக குணமாகும்.

😟 உணர்ச்சிவசப்படுவது அல்லது கவலை
இயல்பானது.
பராமரிப்பு குழுவிடம் சொல்லுங்கள்.

கதிர்வீச்சு சிகிச்சைக்கு பிறகு:
😴 சோர்வு — குறிப்பிடத்தக்கதாக இருக்கலாம்
தேவைப்படும்போது ஓய்வெடுங்கள்.

🤢 மிதமான குமட்டல்
அடிக்கடி சிறிய அளவில் சாப்பிடுங்கள்.

💆 தலையில் உணர்திறன் மற்றும் முடி உதிர்வு
சிகிச்சைக்கு பிறகு முடி மீண்டும் வளரும்.

🧠 நினைவாற்றல் அல்லது சிந்தனை மாற்றங்கள்
தற்காலிகமாக குழப்பமாக உணரலாம்.
பொதுவாக சரியாகும்.

உங்கள் பராமரிப்பு குழு 
ஒவ்வொரு பக்க விளைவையும் 
நிர்வகிக்க உதவும்.
தனியாக சமாளிக்க வேண்டியதில்லை.`,
      `நல்ல ஊட்டச்சத்து குணமடைதலை 
ஆதரிக்கிறது மற்றும் சிகிச்சையின் 
போது உங்கள் வலிமையை 
பராமரிக்கிறது.

✅ நல்ல உணவுகள்:
- சோறு, ரொட்டி, சப்பாத்தி — 
  நிலையான ஆற்றல்
- மீன், முட்டை, கோழி, பருப்பு — 
  வலிமை மற்றும் குணமடைதலுக்கு புரதம்
- பழங்கள் மற்றும் காய்கறிகள் — 
  நோய் எதிர்ப்பு சக்தி
- பால் பொருட்கள்
- தினமும் 8 முதல் 10 கிளாஸ் தண்ணீர்

❌ தவிர்க்க வேண்டியவை:
- மது முற்றிலும்
- மிகவும் காரமான அல்லது எண்ணெய் உணவு
- கதிர்வீச்சின் போது பச்சை உணவு
- அதிக சர்க்கரை

🥤 பசியின்மை இருந்தால்:
- அடிக்கடி சிறிய உணவுகள்
- மென்மையான வசதியான உணவுகள்
- தேவைப்பட்டால் புரத பானங்கள்
- நன்றாக நீரேற்றமாக இருங்கள்`,
      `தரம் 2 நோய் கண்டறிதல்`
    ]
  },

  // ── MENINGIOMA GRADE III ──────────────────────────────────────────────
  meningioma_3: {
    meta: {
      name: { en: 'Meningioma Grade III', si: 'මෙනින්ජියෝමා - ශ්‍රේණිය 3', ta: 'மெனின்ஜியோமா - தரம் 3' },
      accent: '#6b21a8', accentBg: '#faf5ff', icon: 'M3'
    },
    en: [
      `You have a type of brain growth called 
Meningioma. It is Grade 3 — also called 
Anaplastic Meningioma.

Grade 3 is the most aggressive type 
of Meningioma. It grows faster than 
Grade 1 and Grade 2 and has a higher 
chance of coming back after treatment.

We want to be honest with you while 
giving you hope. Grade 3 Meningioma 
is a serious condition that needs 
strong and immediate treatment.
Many people with Grade 3 respond 
to treatment and continue to live 
meaningful lives with their families.

Your doctor has confirmed this after 
careful testing and has a treatment 
plan ready for you.
Your care team is fully committed 
to supporting you every step of the way.`,
      `Grade 3 Meningioma needs immediate 
and aggressive treatment.

🔪 SURGERY
Remove as much of the tumor as 
safely possible.
This is done as soon as possible.
Complete removal is the goal 
but may not always be possible.

☢️ RADIATION THERAPY
After surgery radiation is 
always recommended for Grade 3.
This is very important to 
reduce the chance of it 
coming back quickly.
Radiation is given as:
Standard radiation over 6 weeks
OR Stereotactic radiosurgery

💊 CHEMOTHERAPY
For Grade 3 chemotherapy may 
also be recommended in addition 
to radiation.
Your doctor will decide if 
chemotherapy is needed for you.

🔬 CLINICAL TRIALS
New treatments are being researched.
Ask your doctor if any clinical 
trials are available for you.

Always attend every appointment.
Never miss treatment sessions.
Take all medicines as prescribed.`,
      `🔴 GO TO HOSPITAL RIGHT NOW IF:
- Seizure or body shaking
- Sudden severe headache
- Cannot speak suddenly
- One side of body goes very weak
- You lose consciousness
- Sudden vision changes
- Sudden extreme confusion
- Cannot recognize your family

🟡 CALL YOUR DOCTOR TODAY IF:
- Headache getting worse daily
- Vomiting more than twice
- Fever above 38.5°C
- Feeling very confused
- Vision becoming blurry
- New weakness in arms or legs
- Sudden mood or behavior changes
- Much more tired than usual

🟢 NORMAL DURING TREATMENT:
- Significant tiredness
- Nausea during treatment
- Hair loss — temporary
- Memory or thinking changes
- Feeling emotional or low
- Swelling around surgical area`,
      `Very important questions to ask:

- Was the tumor fully removed?
- Why is radiation always needed for Grade 3?
- Do I need chemotherapy as well?
- How many treatment sessions total?
- How often will I have MRI scans?
- What is the chance of it coming back?
- What happens if it comes back?
- Are there clinical trials available?
- What side effects should I expect?
- Can I work during treatment?
- What support is available for my family?
- Who do I call in an emergency?
- What is palliative care?`,
      `Grade 3 treatment may cause 
stronger side effects.
Your care team will help you 
manage all of them.

😴 SIGNIFICANT TIREDNESS
Very common with Grade 3 treatment.
Rest as much as you need.
Accept help from your family.
Even sitting outside helps.

🤢 NAUSEA AND VOMITING
Eat very small amounts often.
Cold bland foods are easier.
Anti-nausea medicine is available.

💇 HAIR LOSS
During radiation and possibly chemo.
Completely temporary.
Grows back fully after treatment.

🧠 MEMORY AND COGNITIVE CHANGES
Confusion forgetfulness difficulty 
concentrating — all common.
Tell your care team.
Occupational therapy can help.

💊 STEROID SIDE EFFECTS
If taking dexamethasone:
Weight gain in face
Mood changes
Blood sugar changes
All manageable — tell your doctor.

😔 FEELING VERY LOW
Completely understandable.
Please do not suffer alone.
Counseling is available for you.

Your care team is always 
there to help manage 
every side effect. 
You are not alone in this.`,
      `For Grade 3 maintaining good 
nutrition is extremely important 
to keep your strength up.

✅ BEST FOODS:
- High protein — fish eggs 
  chicken lentils cheese nuts
- Complex carbohydrates — 
  rice oats sweet potato
- Colorful fruits and vegetables
- Healthy fats — coconut oil nuts
- Drink 10 glasses of water daily

❌ STRICTLY AVOID:
- Alcohol completely
- Raw or undercooked food 
  during chemotherapy
- Grapefruit with certain medicines
- Very spicy food if nauseous
- Excessive sugar

🥤 WHEN EATING IS VERY DIFFICULT:
- Small amounts every 2 hours
- Nutritional supplement drinks
- Soft foods — banana curd 
  porridge boiled egg soup
- Sip fluids constantly

⚠️ VERY IMPORTANT:
Tell your doctor immediately if:
You cannot eat for more than 2 days
You are losing weight very fast
You feel extremely weak

A hospital dietitian can 
create a personal plan for you.`,
      `Receiving a Grade 3 Meningioma 
diagnosis brings very real fear 
and uncertainty. Your feelings 
are completely valid and human.

You may feel:
- Terrified or in shock
- Angry — why me?
- Deep sadness or grief
- Worried about your family
- Uncertain about the future
- Sometimes moments of peace

All of these feelings are normal.
There is no right or wrong way to feel.

💙 WHAT GENUINELY HELPS:
- Talk with someone you 
  completely trust
- Let your family support you
- Meet a professional counselor
- Connect with others who 
  have faced similar diagnosis
- Do things that bring you 
  joy when you have energy
- Say what is in your heart 
  to the people you love
- Pray meditate or find 
  peace in whatever brings comfort

🗣️ PLEASE TELL YOUR DOCTOR IF:
- You feel you cannot go on
- You feel completely hopeless
- You are having very dark thoughts
- You cannot function or get up
- You feel you are a burden

Professional mental health support 
is available and makes a real difference.

Your life has meaning and value.
Your care team is fully committed 
to your quality of life — 
not just your treatment.

You are not alone.
We are with you every step. 💙`
    ],
    si: [
      `ඔබේ මොළයේ "මෙනින්ජියෝමා" නම් 
වර්ධනයක් ඇති බව සොයාගෙන ඇත.
ශ්‍රේණිය 3 — ඇනප්ලාස්ටික් 
මෙනින්ජියෝමා ලෙසද හැඳින්වේ.

ශ්‍රේණිය 3 මෙනින්ජියෝමාවේ 
වඩාත් ක්‍රියාශීලී වර්ගයයි.
ශ්‍රේණිය 1 සහ 2 ට වඩා 
ශීඝ්‍රයෙන් වැඩෙන නිසා 
ප්‍රතිකාරයෙන් පසු නැවත 
ඒමේ වැඩි ඉඩකඩක් ඇත.

ඔබට සත්‍ය කිවමින්ද 
බලාපොරොත්තුව ද දෙනු 
කැමැත්තෙමු.
ශ්‍රේණිය 3 මෙනින්ජියෝමා 
ශක්තිමත් සහ වහාම 
ප්‍රතිකාරයක් අවශ්‍ය 
බරපතල තත්වයකි.
ශ්‍රේණිය 3 සහිත 
බොහෝ අය ප්‍රතිකාරයට 
ප්‍රතිචාර දක්වා ඔවුන්ගේ 
පවුල් සමඟ අර්ථවත් 
ජීවිතයක් ගත කරයි.

ඔබේ වෛද්‍යවරයා 
සූක්ෂ්ම පරීක්ෂාවෙන් 
පසු මෙය තහවුරු කර 
ඔබ සඳහා ප්‍රතිකාර 
සැලැස්මක් සකස් කර ඇත.
ඔබේ රැකවරණ කණ්ඩායම 
සෑම පියවරකදීම 
ඔබව සහය කිරීමට 
සම්පූර්ණයෙන්ම 
කැපවී සිටී.`,
      `ශ්‍රේණිය 3 මෙනින්ජියෝමාට 
වහාම සහ ශක්තිමත් 
ප්‍රතිකාරයක් අවශ්‍ය වේ.

🔪 ශල්‍යකර්මය
හැකිතාක් ආරක්ෂිතව 
ගෙඩිය ඉවත් කිරීම.
හැකි ඉක්මනින් 
සිදු කෙරේ.
සම්පූර්ණ ඉවත් කිරීම 
ඉලක්කය වුවත් 
සෑම විටම 
සාධ්‍ය නොවිය හැක.

☢️ විකිරණ ප්‍රතිකාරය
ශ්‍රේණිය 3 සඳහා 
ශල්‍යකර්මයෙන් පසු 
විකිරණ සෑම විටම 
නිර්දේශ කෙරේ.
ශීඝ්‍රයෙන් නැවත 
ඒමේ ඉඩකඩ 
අඩු කිරීමට 
මෙය ඉතා 
වැදගත් වේ.

💊 රසායනික ප්‍රතිකාරය
ශ්‍රේණිය 3 සඳහා 
විකිරණ ප්‍රතිකාරයට 
අමතරව 
රසායනික 
ප්‍රතිකාරය ද 
නිර්දේශ 
කළ හැකිය.

🔬 සායනික පරීක්ෂණ
නව ප්‍රතිකාර 
පර්යේෂණය 
කෙරෙමින් ඇත.
ඔබ සඳහා 
සායනික 
පරීක්ෂණ 
ලැබිය හැකිදැයි 
ඔබේ 
වෛද්‍යවරයාගෙන් 
අහන්න.

සෑම 
හමුවකටම 
සෑම විටම 
පැමිණෙන්න.
ප්‍රතිකාර 
සැසි 
කිසිසේත් 
මඟ නොහරින්න.`,
      `🔴 දැන්ම රෝහලට යන්න:
- ආයාසය හෝ 
  ශරීරය කම්පා වීම
- හදිසි දරුණු හිසරදය
- හදිසියේ කතා කිරීමට 
  නොහැකි වීම
- ශරීරයේ එක් පැත්තක් 
  ඉතා දුර්වල වීම
- ඥානය නැතිවීම
- හදිසි දෘෂ්ටි 
  වෙනස්කම්
- හදිසි දරුණු 
  ව්‍යාකූලතාවය
- ඔබේ පවුල 
  හඳුනා ගැනීමට 
  නොහැකි වීම

🟡 අද වෛද්‍යවරයාට 
   කතා කරන්න:
- දිනෙන් දින 
  නරක් වන හිසරදය
- දෙවතාවකට 
  වඩා වමනය
- 38.5°C ට වඩා 
  උෂ්ණත්වය
- ඉතා ව්‍යාකූල 
  දැනීම
- දෑස් 
  අපැහැදිලි වීම
- නව දුර්වලතාවය
- හදිසි 
  මනෝභාවය 
  හෝ හැසිරීම් 
  වෙනස්කම්

🟢 ප්‍රතිකාර 
   අතරතුර 
   සාමාන්‍ය:
- සැලකිය 
  යුතු 
  තෙහෙට්ටුව
- ප්‍රතිකාරය 
  අතරතුර 
  ඔක්කාරය
- හිස කෙස් 
  හැලීම — 
  තාවකාලිකයි
- මතකය 
  හෝ 
  සිතීමේ 
  වෙනස්කම්
- චිත්තවේගීය 
  දැනීම`,
      `අහන්න
ඉතා වැදගත් 
ප්‍රශ්න:

- ගෙඩිය 
  සම්පූර්ණයෙන්ම 
  ඉවත් 
  කෙරුණාද?
- ශ්‍රේණිය 3 
  සඳහා 
  විකිරණ 
  සෑම විටම 
  ඇයි 
  අවශ්‍ය?
- රසායනික 
  ප්‍රතිකාරය ද 
  අවශ්‍යද?
- ප්‍රතිකාර 
  සැසි 
  කීයක් 
  මුළුමනින්ම?
- MRI 
  පරීක්ෂා 
  කොපමණ 
  කාලයකට 
  වරක්ද?
- නැවත 
  ඒමේ 
  ඉඩකඩ 
  කොතරම්ද?
- සායනික 
  පරීක්ෂණ 
  ලැබිය 
  හැකිද?
- හදිසි 
  අවස්ථාවකදී 
  කාට 
  කතා 
  කළ යුතුද?
- සේවා 
  ලක්ෂ්‍ය 
  ප්‍රතිකාරය 
  යනු 
  කුමක්ද?`,
      `බලපෑම්
ශ්‍රේණිය 3 ප්‍රතිකාරය 
ශක්තිමත් 
අතුරු ආබාධ 
ඇති කළ හැක.
ඔබේ රැකවරණ 
කණ්ඩායම 
ඒ සියල්ල 
කළමනාකරණය 
කිරීමට 
උදව් 
කරනු ඇත.

😴 සැලකිය 
   යුතු 
   තෙහෙට්ටුව
ශ්‍රේණිය 3 
ප්‍රතිකාරය 
සමඟ 
ඉතාම 
සාමාන්‍යයි.
ඔබට 
අවශ්‍ය 
තරම් 
විවේකය 
ගන්න.
පවුලෙන් 
සහාය 
පිළිගන්න.

🤢 ඔක්කාරය 
   සහ 
   වමනය
ඉතා 
කුඩා 
ප්‍රමාණ 
නිතර ගන්න.
ප්‍රති-ඔක්කාරය 
ඖෂධ 
ලැබිය හැකිය.

💇 හිස කෙස් 
   හැලීම
විකිරණ 
සහ 
හැකිනම් 
රසායනික 
ප්‍රතිකාරය 
අතරතුරදී.
සම්පූර්ණයෙන්ම 
තාවකාලිකයි.

🧠 මතකය 
   සහ 
   සංජාන 
   වෙනස්කම්
ව්‍යාකූලතාවය, 
අමතක වීම — 
සාමාන්‍ය.
ඔබේ 
රැකවරණ 
කණ්ඩායමට 
කියන්න.

💊 ස්ටෙරොයිඩ් 
   අතුරු 
   ආබාධ
ඩෙක්සාමෙතසෝන් 
ගන්නවා නම්:
විශේෂයෙන් 
මුහුණේ 
බර 
වැඩිවීම
මනෝභාවය 
වෙනස්කම්
රුධිර 
සීනි 
ඉහළ යාම
මේවා 
කළමනාකරණය 
කළ හැකිය.

😔 ඉතා 
   පහත් 
   දැනීම
සම්පූර්ණයෙන්ම 
තේරුම් 
ගත හැකිය.
කරුණාකර 
තනිව 
දුක් 
නොවෙන්න.`,
      `පෝෂණය
ශ්‍රේණිය 3 සඳහා 
හොඳ 
පෝෂණය 
ශක්තිය 
රැකගැනීමට 
ඉතා 
වැදගත්.

✅ හොඳම 
   ආහාර:
- ඉහළ 
  ප්‍රෝටීන් — 
  මාළු, 
  බිත්තර, 
  කුකුල් මස්, 
  පරිප්පු, 
  ගෙඩි
- සංකීර්ණ 
  කාබෝ — 
  බත්, 
  ඕට්ස්, 
  බතල
- වර්ණවත් 
  පලතුරු 
  සහ 
  එළවළු
- සෞඛ්‍ය 
  සම්පන්න 
  මේද
- දිනකට 
  වතුර 
  10ක්

❌ සම්පූර්ණයෙන්ම 
   වළකින්න:
- මත්පැන්
- රසායනික 
  ප්‍රතිකාරය 
  අතරතුර 
  අමු ආහාර
- ද්‍රාක්ෂා ඵලය
- ඔක්කාරයක් 
  ඇත්නම් 
  ඉතාම매운 
  ආහාර

🥤 ආහාර 
   ගැනීම 
   ඉතා 
   දුෂ්කර නම්:
- පැය 2කට 
  වරක් 
  කුඩා ප්‍රමාණ
- පෝෂක 
  අතිරේක 
  පාන
- මෘදු 
  ආහාර

⚠️ ඉතා 
   වැදගත්:
දින 2කට 
වඩා 
ආහාර 
ගත 
නොහැකි නම් 
වෛද්‍යවරයාට 
වහාම 
කියන්න.`,
      `ශ්‍රේණිය 3 
මෙනින්ජියෝමා 
රෝග 
විනිශ්චයක් 
ලැබීම 
ඉතා 
සැබෑ 
භීතිය 
සහ 
අවිනිශ්චිතතාවය 
ගෙනෙයි.
ඔබේ 
හැඟීම් 
සම්පූර්ණයෙන්ම 
වලංගු 
සහ 
මානුෂිකය.

ඔබට 
දැනිය හැකිය:
- භීතිය 
  හෝ 
  කම්පනය
- කෝපය — 
  ඇයි 
  මට?
- ගැඹුරු 
  දුක
- ඔබේ 
  පවුල 
  ගැන 
  කනස්සල්ල
- අවිනිශ්චිතතාවය
- සමහර 
  විට 
  සාමයේ 
  මොහොත්

මේ 
සියලු 
හැඟීම් 
සාමාන්‍යයි.

💙 ඇත්තටම 
   උදව් 
   වන දේ:
- සම්පූර්ණයෙන්ම 
  විශ්වාස 
  කරන 
  කෙනෙකු 
  සමඟ 
  කතා කරන්න
- ඔබේ 
  පවුලට 
  ඔබව 
  සහය 
  කිරීමට 
  ඉඩ දෙන්න
- වෘත්තීය 
  උපදේශකයෙකු 
  හමුවන්න
- ශ්‍රේණිය 3 
  සහිත 
  අනෙකුත් 
  අය සමඟ 
  සම්බන්ධ 
  වන්න
- ශක්තිය 
  ඇති විට 
  සතුට 
  ගෙනෙන 
  දේ කරන්න

🗣️ ඔබේ 
   වෛද්‍යවරයාට 
   කියන්න:
- ඉදිරියට 
  යා 
  නොහැකි 
  දැනෙනවා නම්
- සම්පූර්ණ 
  බලාපොරොත්තු 
  රහිත 
  දැනීම
- ඉතා 
  අඳුරු 
  සිතුවිලි

ඔබේ 
ජීවිතයට 
අරුතක් 
සහ 
වටිනාකමක් 
ඇත.
ඔබේ 
රැකවරණ 
කණ්ඩායම 
ඔබ 
සමඟ 
සිටී. 💙`
    ],
    ta: [
      `உங்கள் மூளையில் "மெனின்ஜியோமா" 
என்ற வளர்ச்சி இருப்பதை 
கண்டுபிடித்துள்ளார்.
தரம் 3 — அனாப்லாஸ்டிக் 
மெனின்ஜியோமா என்றும் அழைக்கப்படுகிறது.

தரம் 3 மெனின்ஜியோமாவின் 
மிகவும் தீவிரமான வகை.
தரம் 1 மற்றும் 2 ஐ விட 
வேகமாக வளர்வதால் சிகிச்சைக்கு 
பிறகு மீண்டும் வரும் 
அதிக வாய்ப்பு உள்ளது.

நாங்கள் உங்களிடம் நேர்மையாக 
இருக்கவும் நம்பிக்கை தரவும் விரும்புகிறோம்.
தரம் 3 மெனின்ஜியோமா வலிமையான 
மற்றும் உடனடி சிகிச்சை தேவைப்படும் 
தீவிரமான நிலை.
தரம் 3 உள்ள பலர் சிகிச்சையால் 
பலன் பெற்று குடும்பத்தினருடன் 
அர்த்தமுள்ள வாழ்க்கையை தொடர்கிறார்கள்.

உங்கள் மருத்துவர் கவனமான 
சோதனைக்கு பிறகு இதை உறுதிப்படுத்தி 
உங்களுக்காக சிகிச்சை திட்டம் 
தயார் செய்துள்ளார்.
உங்கள் பராமரிப்பு குழு 
ஒவ்வொரு அடியிலும் உங்களை 
ஆதரிக்க முழுமையாக அர்ப்பணித்துள்ளது.`,
      `தரம் 3 மெனின்ஜியோமாவுக்கு 
உடனடியும் தீவிரமான சிகிச்சை தேவை.

🔪 அறுவை சிகிச்சை
பாதுகாப்பாக முடிந்தவரை 
கட்டியை அகற்றுவது.
இது முடிந்தவரை விரைவில் செய்யப்படுகிறது.
முழுமையான அகற்றல் இலக்கு 
ஆனால் எப்போதும் சாத்தியமில்லை.

☢️ கதிர்வீச்சு சிகிச்சை
தரம் 3 க்கு அறுவை சிகிச்சைக்கு 
பிறகு கதிர்வீச்சு எப்போதும் 
பரிந்துரைக்கப்படுகிறது.
விரைவாக மீண்டும் வரும் வாய்ப்பை 
குறைக்க இது மிகவும் முக்கியம்.

💊 கீமோதெரபி
தரம் 3 க்கு கதிர்வீச்சுக்கு 
கூடுதலாக கீமோதெரபியும் 
பரிந்துரைக்கப்படலாம்.
உங்களுக்கு கீமோதெரபி தேவையா 
என்பதை மருத்துவர் தீர்மானிப்பார்.

🔬 மருத்துவ பரிசோதனைகள்
புதிய சிகிச்சைகள் ஆராயப்படுகின்றன.
உங்களுக்கு மருத்துவ பரிசோதனைகள் 
கிடைக்குமா என்று மருத்துவரிடம் கேளுங்கள்.

எப்போதும் ஒவ்வொரு சந்திப்பிற்கும் வாருங்கள்.
சிகிச்சை அமர்வுகளை தவிர்க்காதீர்கள்.`,
      `🔴 இப்போதே மருத்துவமனைக்கு செல்லுங்கள்:
- வலிப்பு அல்லது உடல் நடுங்குதல்
- திடீர் கடுமையான தலைவலி
- திடீரென்று பேச முடியாமல் போவது
- உடலின் ஒரு பக்கம் மிகவும் பலவீனமாவது
- நனவு இழப்பு
- திடீர் பார்வை மாற்றங்கள்
- திடீர் தீவிர குழப்பம்
- குடும்பத்தினரை அடையாளம் 
  காண முடியாமல் போவது

🟡 இன்றே மருத்துவரை அழையுங்கள்:
- தினமும் மோசமாகும் தலைவலி
- இரண்டு முறைக்கும் மேல் வாந்தி
- 38.5°C க்கும் அதிகமான காய்ச்சல்
- மிகவும் குழப்பமான உணர்வு
- பார்வை மங்கலாவது
- கைகள் கால்களில் புதிய பலவீனம்
- திடீர் மனநிலை அல்லது 
  நடத்தை மாற்றங்கள்

🟢 சிகிச்சையின் போது இயல்பானவை:
- குறிப்பிடத்தக்க சோர்வு
- சிகிச்சையின் போது குமட்டல்
- முடி உதிர்வு — தற்காலிகமானது
- நினைவாற்றல் அல்லது சிந்தனை மாற்றங்கள்
- உணர்ச்சிவசப்படுவது அல்லது சோர்வாக உணர்வது`,
      `மிகவும் முக்கியமான கேள்விகள்:

- கட்டி முழுமையாக அகற்றப்பட்டதா?
- தரம் 3 க்கு கதிர்வீச்சு 
  ஏன் எப்போதும் தேவை?
- கீமோதெரபியும் தேவையா?
- மொத்தம் எத்தனை சிகிச்சை அமர்வுகள்?
- எத்தனை காலத்திற்கு ஒரு முறை MRI?
- மீண்டும் வரும் வாய்ப்பு எவ்வளவு?
- மீண்டும் வந்தால் என்ன நடக்கும்?
- மருத்துவ பரிசோதனைகள் கிடைக்குமா?
- என்ன பக்க விளைவுகளை எதிர்பார்க்கலாம்?
- சிகிச்சையின் போது வேலை செய்யலாமா?
- அவசரநிலையில் யாரை அழைக்க வேண்டும்?
- தளர்வு பராமரிப்பு என்றால் என்ன?`,
      `தரம் 3 சிகிச்சை அதிக பக்க விளைவுகளை 
ஏற்படுத்தலாம்.
உங்கள் பராமரிப்பு குழு அவை 
அனைத்தையும் நிர்வகிக்க உதவும்.

😴 குறிப்பிடத்தக்க சோர்வு
தரம் 3 சிகிச்சையில் 
மிகவும் இயல்பானது.
தேவைப்படும் அளவு ஓய்வெடுங்கள்.
குடும்பத்தினரிடம் உதவி பெறுங்கள்.

🤢 குமட்டல் மற்றும் வாந்தி
மிகவும் சிறிய அளவில் அடிக்கடி சாப்பிடுங்கள்.
குமட்டல் எதிர்ப்பு மருந்து கிடைக்கும்.

💇 முடி உதிர்வு
கதிர்வீச்சு மற்றும் கீமோதெரபியின் போது.
முற்றிலும் தற்காலிகமானது.
சிகிச்சைக்கு பிறகு முடி மீண்டும் வளரும்.

🧠 நினைவாற்றல் மற்றும் அறிவாற்றல் மாற்றங்கள்
குழப்பம் மறதி — இயல்பானது.
உங்கள் பராமரிப்பு குழுவிடம் சொல்லுங்கள்.

💊 ஸ்டீராய்டு பக்க விளைவுகள்
டெக்ஸாமெதசோன் எடுத்தால்:
முகத்தில் எடை அதிகரிப்பு
மனநிலை மாற்றங்கள்
இரத்த சர்க்கரை மாற்றங்கள்
அனைத்தும் நிர்வகிக்கப்படலாம்.

😔 மிகவும் சோர்வாக உணர்வது
முற்றிலும் புரிந்துகொள்ளத்தக்கது.
தனியாக கஷ்டப்படாதீர்கள்.
ஆலோசனை கிடைக்கும்.`,
      `தரம் 3 க்கு நல்ல ஊட்டச்சத்து 
மூலம் வலிமையை பராமரிப்பது 
மிகவும் முக்கியம்.

✅ சிறந்த உணவுகள்:
- அதிக புரதம் — மீன் முட்டை 
  கோழி பருப்பு பனீர் கொட்டைகள்
- சிக்கலான கார்போஹைட்ரேட் — 
  சோறு ஓட்ஸ் சர்க்கரைவள்ளிக்கிழங்கு
- வண்ணமயமான பழங்கள் மற்றும் காய்கறிகள்
- ஆரோக்கியமான கொழுப்புகள்
- தினமும் 10 கிளாஸ் தண்ணீர்

❌ கண்டிப்பாக தவிர்க்க வேண்டியவை:
- மது முற்றிலும்
- கீமோதெரபியின் போது பச்சை உணவு
- திராட்சைப்பழம்
- குமட்டல் இருந்தால் காரமான உணவு
- அதிக சர்க்கரை

🥤 சாப்பிடுவது மிகவும் கடினமாக இருந்தால்:
- 2 மணி நேரத்திற்கு ஒரு முறை 
  சிறிய அளவில்
- ஊட்டச்சத்து சப்ளிமெண்ட் பானங்கள்
- மென்மையான உணவுகள்
- நாள் முழுவதும் திரவங்கள் குடியுங்கள்

⚠️ மிகவும் முக்கியம்:
2 நாட்களுக்கும் மேல் சாப்பிட முடியவில்லை 
என்றால் மருத்துவரிடம் உடனே சொல்லுங்கள்.`,
      `தரம் 3 மெனின்ஜியோமா நோய்`
    ]
  },

  // ── PITUITARY TUMOR GRADE I ──────────────────────────────────────────────
  pituitary_1: {
    meta: {
      name: { en: 'Pituitary Tumor Grade I', si: 'පිටියුටරි ගෙඩිය - ශ්‍රේණිය 1', ta: 'பிட்யூட்டரி கட்டி - தரம் 1' },
      accent: '#ea580c', accentBg: '#fff7ed', icon: 'P1'
    },
    en: [
      `You have a type of growth called a 
Pituitary Tumor or Pituitary Adenoma.
It is Grade 1 — this means it is 
benign (not cancerous) and 
slow growing.

The pituitary gland is a small 
but very important gland at the 
base of your brain. It controls 
many hormones in your body including 
growth hormones stress hormones 
and reproductive hormones.

A Grade 1 pituitary tumor is 
usually small and called a microadenoma
(smaller than 10mm).

Many people with Grade 1 pituitary 
tumors live completely normal lives.
Some tumors are found by accident 
during brain scans for other reasons.

Your doctor has a plan to 
take the best care of you.
You are in very good hands.`,
      `Treatment for Grade 1 Pituitary 
Tumor depends on whether it is 
causing hormone problems or symptoms.

👁️ WATCH AND WAIT
If the tumor is small and not 
causing symptoms your doctor 
may monitor it with regular 
MRI scans.
This is very common for 
small pituitary tumors.

💊 MEDICATION
Some pituitary tumors respond 
very well to medicine.
Dopamine agonist tablets 
(like Cabergoline or Bromocriptine) 
can shrink certain types of 
pituitary tumors significantly.
Always take medicine as prescribed.

🔪 SURGERY
If medicine does not work or 
if the tumor is causing vision 
problems surgery may be needed.
Pituitary surgery is usually done 
through the nose — not through 
the skull.
Recovery is usually quicker 
than other brain surgeries.

☢️ RADIATION THERAPY
If surgery is not fully successful 
radiation may be recommended.

Your doctor will explain 
the best option for your 
specific situation.`,
      `🔴 GO TO HOSPITAL RIGHT NOW IF:
- Sudden complete vision loss 
  in one or both eyes
- Sudden very severe headache
  (pituitary apoplexy — emergency)
- You lose consciousness
- Sudden confusion or collapse
- Cannot see properly suddenly

🟡 CALL YOUR DOCTOR TODAY IF:
- Vision becoming blurry or 
  tunnel vision developing
- Severe headache getting worse daily
- Sudden hormonal symptoms:
  - Extreme thirst and frequent urination
  - Sudden weight changes
  - Extreme fatigue
- Feeling very confused

🟢 COMMON SYMPTOMS TO MONITOR:
- Mild headache
- Vision changes — 
  report to doctor regularly
- Hormonal changes — 
  mood weight cycles
  → Tell your doctor at each visit`,
      `Important questions to ask:

- What type of pituitary tumor is it?
- Is it producing hormones?
- Do I need medicine or surgery?
- How often will I have MRI scans?
- How will we check my hormone levels?
- What symptoms should worry me?
- Can it affect my vision permanently?
- Can I drive and work normally?
- Will it grow back after treatment?
- Does this affect my ability 
  to have children?
- Who do I call if I feel unwell?`,
      `Side effects depend on your treatment.

IF TAKING MEDICATION:
🤢 Nausea — especially at first
Take medicine with food.
Starts on low dose and increases slowly.

😴 Dizziness or lightheadedness
Stand up slowly.
Tell your doctor if severe.

😟 Mood changes
Some people feel low or anxious.
Tell your doctor — 
dose adjustment may help.

IF SURGERY IS DONE:
😴 Tiredness — very common
Rest well. Recovery takes time.

🤧 Nasal stuffiness or discharge
Normal after nose surgery.
Avoid blowing nose hard for weeks.

💧 Excessive thirst or urination
May indicate diabetes insipidus — 
a temporary hormone imbalance.
Tell your doctor immediately.

🧠 Temporary memory or 
   thinking changes
Usually improves with time.

Most Grade 1 pituitary tumor 
patients recover very well!`,
      `Good nutrition supports hormone 
balance and overall recovery.

✅ GOOD FOODS:
- Balanced meals — 
  rice bread vegetables protein
- Calcium rich foods — 
  milk curd cheese
  (important for bone health 
  if hormones are affected)
- Iron rich foods — 
  fish eggs green vegetables
- Drink plenty of water daily

❌ AVOID:
- Alcohol — especially if 
  on hormonal medication
- Very salty food if 
  blood pressure is affected
- Excessive caffeine

🥤 IF APPETITE OR WEIGHT IS AFFECTED:
- Small frequent meals
- Track your weight weekly
- Tell your doctor about 
  significant weight changes

⚠️ NOTE:
Pituitary tumors can affect 
your metabolism and hormone levels.
Your nutritional needs may be 
different from other tumor patients.
Ask your doctor if a specialist 
dietitian review is needed.`,
      `A pituitary tumor diagnosis can 
bring unique emotional challenges 
because pituitary hormones affect 
your mood energy and wellbeing directly.

You may feel:
- Anxious or worried
- Unusually sad or low — 
  this may be partly hormonal
- Confused about what this means
- Relieved it is benign 
  but still unsettled
- Frustrated with ongoing monitoring

💙 THINGS THAT HELP:
- Understand that mood changes 
  may be hormonal — 
  not just emotional
- Talk openly with family 
  and your care team
- Ask all your questions — 
  this tumor type is very treatable
- Join a pituitary tumor 
  support group if possible
- Rest when you need to
- Do activities that bring you joy

🗣️ TELL YOUR DOCTOR IF:
- You feel persistently very sad
- Your mood has changed significantly
- You feel very anxious every day
- You cannot sleep or function well
- You feel hopeless

Hormonal treatment may directly 
improve your mood and wellbeing.
Professional mental health support 
is also available.

You have a very treatable condition.
Your care team is fully with you. 💙`
    ],
    si: [
      `ඔබේ මොළයේ පිටියුටරි ගෙඩියක් 
හෝ පිටියුටරි ඇඩෙනෝමාවක් 
ඇති බව සොයාගෙන ඇත.
ශ්‍රේණිය 1 — මෙය 
නිර්දෝෂී (පිළිකාවක් නොවේ) 
සහ සෙමින් වැඩෙන ගෙඩියකි.

පිටියුටරි ග්‍රන්ථිය ඔබේ 
මොළයේ පාමුලේ ඇති 
කුඩා නමුත් ඉතා වැදගත් 
ග්‍රන්ථියකි.
වර්ධන හෝමෝන, ආතති 
හෝමෝන සහ ප්‍රජනක 
හෝමෝන ඇතුළු ශරීරයේ 
බොහෝ හෝමෝන 
ඉදිරිය කරයි.

ශ්‍රේණිය 1 පිටියුටරි ගෙඩිය 
සාමාන්‍යයෙන් කුඩා වන 
නිසා මයික්‍රෝඇඩෙනෝමා 
ලෙස හැඳින්වේ
(10mm ට වඩා කුඩා).

ශ්‍රේණිය 1 පිටියුටරි ගෙඩි 
සහිත බොහෝ අය 
සම්පූර්ණයෙන්ම 
සාමාන්‍ය ජීවිතයක් 
ගත කරයි.
සමහර ගෙඩි 
අනෙකුත් හේතු 
සඳහා මොළ 
ස්කෑන් අතරතුර 
අහම්බෙන් 
සොයාගනී.

ඔබේ වෛද්‍යවරයා 
ඔබව හොඳින් 
රැකගැනීමට 
සැලැස්මක් 
ඇත.
ඔබ ඉතා 
හොඳ 
අතේ සිටී.`,
      `ශ්‍රේණිය 1 පිටියුටරි 
ගෙඩියට ප්‍රතිකාරය 
හෝමෝන 
ගැටළු හෝ 
රෝග ලක්ෂණ 
ඇති කරන්නේ 
දැයි 
අනුව 
වෙනස් වේ.

👁️ නිරීක්ෂණය
ගෙඩිය කුඩා නම් 
සහ රෝග 
ලක්ෂණ ඇති 
නොකරන්නේ නම් 
ඔබේ වෛද්‍යවරයා 
නිතිපතා MRI 
සමඟ නිරීක්ෂණය 
කළ හැකිය.
කුඩා 
පිටියුටරි ගෙඩි 
සඳහා 
මෙය ඉතා 
සාමාන්‍යයි.

💊 ඖෂධ
සමහර 
පිටියුටරි ගෙඩි 
ඖෂධ වලට 
ඉතා හොඳින් 
ප්‍රතිචාර 
දක්වයි.
ඩොපමීන් 
ඇගෝනිස්ට් 
ටැබ්ලට් 
(කැබර්ගොලීන් 
හෝ 
බ්‍රොමොක්‍රිප්ටීන්) 
ඇතැම් 
ගෙඩි 
ස්වල්ප 
කිරීමට 
සැලකිය 
යුතු 
ලෙස 
උදව් 
කරයි.

🔪 ශල්‍යකර්මය
ඖෂධ 
වැඩ 
නොකළහොත් 
හෝ ගෙඩිය 
දෘෂ්ටි 
ගැටළු 
ඇති 
කරන්නේ 
නම් 
ශල්‍යකර්මය 
අවශ්‍ය 
විය හැකිය.
පිටියුටරි 
ශල්‍යකර්මය 
සාමාන්‍යයෙන් 
නාසය 
හරහා 
සිදු කෙරේ — 
හිස්කබල 
හරහා 
නොවේ.

ඔබේ 
නිශ්චිත 
තත්වයට 
හොඳම 
විකල්පය 
ඔබේ 
වෛද්‍යවරයා 
පැහැදිලි 
කරනු 
ඇත.`,
      `🔴 දැන්ම රෝහලට යන්න:
- එක් හෝ දෙකම 
  ඇසින් හදිසි 
  සම්පූර්ණ 
  දෘෂ්ටි喪失
- හදිසි ඉතා 
  දරුණු හිසරදය
  (පිටියුටරි 
  ඇපොප්ලෙක්සි — 
  හදිසි 
  අවස්ථාවකි)
- ඥානය නැතිවීම
- හදිසි 
  ව්‍යාකූලතාවය 
  හෝ 
  ඇද වැටීම

🟡 අද වෛද්‍යවරයාට 
   කතා කරන්න:
- දෑස් 
  අපැහැදිලි 
  වීම 
  හෝ 
  ශ්‍රේය 
  දෘෂ්ටිය
- දිනෙන් 
  දින 
  නරක් 
  වන 
  දරුණු 
  හිසරදය
- හදිසි 
  හෝමෝනල් 
  රෝග 
  ලක්ෂණ

🟢 නිරීක්ෂණය 
   කළ යුතු 
   සාමාන්‍ය 
   රෝග 
   ලක්ෂණ:
- මෘදු 
  හිසරදය
- දෘෂ්ටි 
  වෙනස්කම් — 
  නිතිපතා 
  වෛද්‍යවරයාට 
  දන්වන්න
- හෝමෝනල් 
  වෙනස්කම් — 
  සෑම 
  හමුවකදීම 
  කියන්න`,
      `අහන්න
වැදගත් ප්‍රශ්න:

- පිටියුටරි 
  ගෙඩිය 
  කුමන 
  වර්ගයේද?
- හෝමෝන 
  නිෂ්පාදනය 
  කරනවාද?
- ඖෂධ 
  අවශ්‍යද 
  නැතිනම් 
  ශල්‍යකර්මයද?
- MRI 
  පරීක්ෂා 
  කොපමණ 
  කාලයකට 
  වරක්ද?
- හෝමෝන 
  මට්ටම් 
  පරීක්ෂා 
  කරන්නේ 
  කෙසේද?
- දෘෂ්ටිය 
  ස්ථිරවම 
  බලපාන 
  ලදිද?
- දරු 
  ලැබීමේ 
  හැකියාව 
  බලපාන 
  ලදිද?
- නැවත 
  වර්ධනය 
  වේද?`,
      `බලපෑම්
ඖෂධ 
ගන්නවා නම්:
🤢 ඔක්කාරය — 
   විශේෂයෙන් 
   ආරම්භයේදී
ආහාර 
සමඟ 
ඖෂධ 
ගන්න.
අඩු 
මාත්‍රාවෙන් 
ආරම්භ 
වේ.

😴 කරකැවිල්ල 
   හෝ 
   හිස් 
   සැහීම
සෙමෙන් 
නැගිටින්න.

😟 මනෝභාවය 
   වෙනස්කම්
සමහරු 
පහත් 
හෝ 
කනස්සල්ලෙන් 
දැනෙයි.
ඔබේ 
වෛද්‍යවරයාට 
කියන්න.

ශල්‍යකර්මය 
සිදු 
කළේ නම්:
😴 තෙහෙට්ටුව — 
   ඉතාම 
   සාමාන්‍යයි
හොඳින් 
විවේකය 
ගන්න.

🤧 නාසය 
   හිරවීම 
   හෝ 
   ස්‍රාවය
නාසය 
ශල්‍යකර්මයෙන් 
පසු 
සාමාන්‍යයි.
සතිවලින් 
නාසය 
ජවසම්පන්නව 
නොදොඩන්න.

💧 අධික 
   පිපාසය 
   හෝ 
   මූත්‍රා
හදිසි 
ඩයබිටීස් 
ඉන්සිපිඩස් 
ලකුණක් 
විය හැක — 
වහාම 
වෛද්‍යවරයාට 
කියන්න.

ශ්‍රේණිය 1 
රෝගීන් 
බොහෝ 
දෙනා 
ඉතා 
හොඳින් 
සුව 
වෙති!`,
      `පෝෂණය
හොඳ 
පෝෂණය 
හෝමෝන 
සමතුලිතතාවය 
සහ 
සෙසු 
සුව 
වීමට 
සහය 
වේ.

✅ හොඳ 
   ආහාර:
- සමබර 
  ආහාර — 
  බත්, 
  පාන්, 
  එළවළු, 
  ප්‍රෝටීන්
- කැල්සියම් 
  බහුල 
  ආහාර — 
  කිරි, 
  දෝ, 
  චීස්
  (හෝමෝන 
  බලපෑමෙන් 
  ඇට 
  ශක්තිය 
  සඳහා 
  වැදගත්)
- යකඩ 
  බහුල 
  ආහාර — 
  මාළු, 
  බිත්තර, 
  කොළ 
  එළවළු
- දිනකට 
  ජලය 
  ප්‍රමාණවත් 
  ලෙස 
  බොන්න

❌ වළකින්න:
- මත්පැන් — 
  විශේෂයෙන් 
  හෝමෝනල් 
  ඖෂධ 
  ගන්නවා නම්
- ඉතාම 
  ලුණු 
  ආහාර
- අධික 
  කැෆේන්

⚠️ සටහන:
පිටියුටරි 
ගෙඩි 
ඔබේ 
පරිවෘත්තීය 
සහ 
හෝමෝන 
මට්ටම් 
බලපෑමට 
ලක් 
කළ 
හැකිය.
ඔබේ 
පෝෂණ 
අවශ්‍යතා 
වෙනස් 
විය 
හැකිය.`,
      `පිටියුටරි 
ගෙඩි 
රෝග 
විනිශ්චය 
ඔබේ 
මනෝභාවය 
ශක්තිය 
සහ 
යහපැවැත්ම 
කෙලින්ම 
බලපෑමෙන් 
අද්විතීය 
සංවේදී 
අභියෝග 
ගෙනෙයි.

ඔබට 
දැනිය 
හැකිය:
- කනස්සල්ල 
  හෝ 
  බිය
- අසාමාන්‍ය 
  ලෙස 
  දුක් 
  හෝ 
  පහත් — 
  මෙය 
  හෝමෝනල් 
  විය 
  හැකිය
- නිර්දෝෂී 
  බව 
  ලිහිල් 
  දැනෙමින් 
  නමුත් 
  තවමත් 
  නිරවුල් 
  නොවූ 
  දැනීමක්
- දිගු 
  නිරීක්ෂණය 
  ගැන 
  කලකිරීම

💙 උදව් 
   වන දේ:
- මනෝභාවය 
  වෙනස්කම් 
  හෝමෝනල් 
  විය හැකිය 
  — 
  හුදෙක් 
  සංවේදී 
  නොවේ 
  යන්න 
  තේරුම් 
  ගන්න
- පවුල 
  සහ 
  රැකවරණ 
  කණ්ඩායම 
  සමඟ 
  විවෘතව 
  කතා කරන්න
- හෝමෝනල් 
  ප්‍රතිකාරය 
  ඔබේ 
  මනෝභාවය 
  කෙලින්ම 
  වැඩිදියුණු 
  කළ හැකිය

🗣️ ඔබේ 
   වෛද්‍යවරයාට 
   කියන්න:
- දිගු 
  කාලයක් 
  ඉතා 
  දුකක් 
  දැනෙනවා නම්
- මනෝභාවය 
  සැලකිය 
  යුතු ලෙස 
  වෙනස් 
  වී ඇත්නම්
- නිදා 
  ගත 
  නොහැකි 
  නම්

ඔබට 
ඉතා 
ප්‍රතිකාර 
කළ 
හැකි 
තත්වයක් 
ඇත.
ඔබේ 
රැකවරණ 
කණ්ඩායම 
ඔබ 
සමඟ 
සිටී. 💙`
    ],
    ta: [
      `உங்கள் மூளையில் பிட்யூட்டரி 
கட்டி அல்லது பிட்யூட்டரி 
அடினோமா இருப்பதை 
கண்டுபிடித்துள்ளார்.
தரம் 1 — இது நேர்மையான 
(புற்றுநோயல்லாத) மற்றும் 
மெதுவாக வளரும் கட்டி.

பிட்யூட்டரி சுரப்பி உங்கள் 
மூளையின் அடிப்பகுதியில் உள்ள 
சிறிய ஆனால் மிகவும் முக்கியமான 
சுரப்பி.
வளர்ச்சி ஹார்மோன்கள் மன அழுத்த 
ஹார்மோன்கள் மற்றும் இனப்பெருக்க 
ஹார்மோன்கள் உள்ளிட்ட உடலில் 
பல ஹார்மோன்களை கட்டுப்படுத்துகிறது.

தரம் 1 பிட்யூட்டரி கட்டி பொதுவாக 
சிறியதாக இருக்கும் மற்றும் 
மைக்ரோஆடினோமா என்று அழைக்கப்படுகிறது
(10mm க்கும் சிறியது).

தரம் 1 பிட்யூட்டரி கட்டி உள்ள 
பலர் முற்றிலும் இயல்பான 
வாழ்க்கை வாழ்கிறார்கள்.
சில கட்டிகள் மற்ற காரணங்களுக்காக 
செய்யப்பட்ட மூளை ஸ்கேனில் 
தற்செயலாக கண்டுபிடிக்கப்படுகின்றன.

உங்கள் மருத்துவர் உங்களை 
சிறப்பாக கவனிக்க திட்டம் 
தயார் செய்துள்ளார்.
நீங்கள் மிகவும் நல்ல 
கைகளில் இருக்கிறீர்கள்.`,
      `தரம் 1 பிட்யூட்டரி கட்டிக்கு 
சிகிச்சை ஹார்மோன் பிரச்சனைகள் 
அல்லது அறிகுறிகளை ஏற்படுத்துகிறதா 
என்பதைப் பொறுத்து மாறுபடும்.

👁️ கவனிப்பு மற்றும் காத்திருப்பு
கட்டி சிறியதாக இருந்தால் 
மற்றும் அறிகுறிகளை ஏற்படுத்தவில்லை 
என்றால் மருத்துவர் வழக்கமான 
MRI பரிசோதனைகளுடன் கண்காணிக்கலாம்.
சிறிய பிட்யூட்டரி கட்டிகளுக்கு 
இது மிகவும் பொதுவானது.

💊 மருந்து
சில பிட்யூட்டரி கட்டிகள் 
மருந்துகளுக்கு மிகவும் நன்றாக 
பதிலளிக்கின்றன.
டோபமைன் அகோனிஸ்ட் மாத்திரைகள் 
(காபர்கோலைன் அல்லது 
பிரோமோக்ரிப்டின்) சில வகை 
பிட்யூட்டரி கட்டிகளை குறிப்பிடத்தக்க 
அளவில் சுருக்கலாம்.
எப்போதும் மருந்துகளை நியமிக்கப்பட்டபடி எடுங்கள்.

🔪 அறுவை சிகிச்சை
மருந்து வேலை செய்யவில்லை 
என்றால் அல்லது கட்டி பார்வை 
பிரச்சனைகளை ஏற்படுத்தினால் 
அறுவை சிகிச்சை தேவைப்படலாம்.
பிட்யூட்டரி அறுவை சிகிச்சை 
பொதுவாக மூக்கு வழியாக செய்யப்படுகிறது — 
மண்டையோடு வழியாக அல்ல.

உங்கள் குறிப்பிட்ட நிலைமைக்கு 
சிறந்த விருப்பத்தை 
மருத்துவர் விளக்குவார்.`,
      `🔴 இப்போதே மருத்துவமனைக்கு செல்லுங்கள்:
- ஒன்று அல்லது இரண்டு கண்களிலும் 
  திடீர் முழுமையான பார்வை இழப்பு
- திடீர் மிகவும் கடுமையான தலைவலி
  (பிட்யூட்டரி அபோப்ளெக்ஸி — அவசரநிலை)
- நனவு இழப்பு
- திடீர் குழப்பம் அல்லது சரிவு

🟡 இன்றே மருத்துவரை அழையுங்கள்:
- பார்வை மங்கலாவது அல்லது 
  குகை பார்வை உருவாவது
- தினமும் மோசமாகும் கடுமையான தலைவலி
- திடீர் ஹார்மோன் அறிகுறிகள்:
  - அதிக தாகம் மற்றும் அடிக்கடி சிறுநீர்
  - திடீர் எடை மாற்றங்கள்
  - தீவிர சோர்வு

🟢 கண்காணிக்க வேண்டிய 
   பொதுவான அறிகுறிகள்:
- மிதமான தலைவலி
- பார்வை மாற்றங்கள் — 
  தொடர்ந்து மருத்துவரிடம் தெரிவிக்கவும்
- ஹார்மோன் மாற்றங்கள் — 
  ஒவ்வொரு சந்திப்பிலும் சொல்லுங்கள்`,
      `முக்கியமான கேள்விகள்:

- பிட்யூட்டரி கட்டி என்ன வகை?
- ஹார்மோன்களை உற்பத்தி செய்கிறதா?
- மருந்து தேவையா அல்லது அறுவை சிகிச்சையா?
- எத்தனை காலத்திற்கு ஒரு முறை MRI?
- ஹார்மோன் மட்டங்களை எவ்வாறு சரிபார்ப்போம்?
- என்ன அறிகுறிகள் என்னை கவலைப்படுத்த வேண்டும்?
- பார்வையை நிரந்தரமாக பாதிக்குமா?
- வாகனம் ஓட்டலாமா, வேலை செய்யலாமா?
- சிகிச்சைக்கு பிறகு மீண்டும் வளருமா?
- குழந்தை பெற்றுக்கொள்ளும் திறனை பாதிக்குமா?`,
      `மருந்து எடுத்தால்:
🤢 குமட்டல் — குறிப்பாக ஆரம்பத்தில்
உணவுடன் மருந்து எடுங்கள்.
குறைந்த அளவில் தொடங்கி படிப்படியாக அதிகரிக்கும்.

😴 தலைசுற்றல் அல்லது லேசான தலை
மெதுவாக எழுந்திருங்கள்.
தீவிரமாக இருந்தால் மருத்துவரிடம் சொல்லுங்கள்.

😟 மனநிலை மாற்றங்கள்
சிலர் சோர்வாக அல்லது கவலையாக உணர்கிறார்கள்.
மருத்துவரிடம் சொல்லுங்கள்.

அறுவை சிகிச்சை செய்யப்பட்டால்:
😴 சோர்வு — மிகவும் இயல்பானது
நன்றாக ஓய்வெடுங்கள்.

🤧 மூக்கு அடைப்பு அல்லது சுரப்பு
மூக்கு அறுவை சிகிச்சைக்கு பிறகு இயல்பானது.
வாரங்களுக்கு மூக்கை ஜோரமாக சிந்தாதீர்கள்.

💧 அதிக தாகம் அல்லது சிறுநீர்
டயாபடீஸ் இன்சிபிடஸ் அறிகுறியாக இருக்கலாம் — 
உடனே மருத்துவரிடம் சொல்லுங்கள்.

தரம் 1 நோயாளிகள் பெரும்பாலும் 
மிகவும் நன்றாக குணமடைகிறார்கள்!`,
      `நல்ல ஊட்டச்சத்து ஹார்மோன் 
சமநிலையை ஆதரிக்கிறது மற்றும் 
ஒட்டுமொத்த குணமடைதலுக்கு உதவுகிறது.

✅ நல்ல உணவுகள்:
- சமச்சீரான உணவுகள் — 
  சோறு ரொட்டி காய்கறிகள் புரதம்
- கால்சியம் நிறைந்த உணவுகள் — 
  பால் தயிர் பனீர்
  (ஹார்மோன் பாதிக்கப்பட்டால் 
  எலும்பு ஆரோக்கியத்திற்கு முக்கியம்)
- இரும்புச் சத்து நிறைந்த உணவுகள் — 
  மீன் முட்டை பச்சை காய்கறிகள்
- தினமும் போதுமான தண்ணீர் குடியுங்கள்

❌ தவிர்க்க வேண்டியவை:
- மது — குறிப்பாக ஹார்மோன் மருந்து எடுத்தால்
- மிகவும் உப்பு உணவு
- அதிக காஃபின்

⚠️ குறிப்பு:
பிட்யூட்டரி கட்டிகள் உங்கள் 
வளர்சிதை மாற்றம் மற்றும் 
ஹார்மோன் மட்டங்களை பாதிக்கலாம்.
உங்கள் ஊட்டச்சத்து தேவைகள் 
வேறுபட்டிருக்கலாம்.
சிறப்பு உணவியல் நிபுணர் 
தேவையா என்று மருத்துவரிடம் கேளுங்கள்.`,
      `பிட்யூட்டரி கட்டி நோய் கண்டறிதல் 
பிட்யூட்டரி ஹார்மோன்கள் உங்கள் 
மனநிலை ஆற்றல் மற்றும் 
நலனை நேரடியாக பாதிப்பதால் 
தனித்துவமான உணர்வு சவால்களை 
கொண்டு வரலாம்.

உணரலாம்:
- கவலை அல்லது பயம்
- வழக்கத்திற்கு மாறாக சோகமாக 
  அல்லது சோர்வாக உணர்வது — 
  இது ஓரளவு ஹார்மோனல் ஆக இருக்கலாம்
- இது நேர்மையானது என்று நிம்மதியாகவும் 
  ஆனால் இன்னும் தொந்தரவாகவும் உணர்வது
- தொடர்ந்த கண்காணிப்பில் விரக்தி

💙 உதவக்கூடியவை:
- மனநிலை மாற்றங்கள் ஹார்மோனல் 
  ஆக இருக்கலாம் — 
  வெறும் உணர்ச்சி அல்ல என்று புரிந்துகொள்ளுங்கள்
- குடும்பத்தினர் மற்றும் 
  பராமரிப்பு குழுவிடம் திறந்து பேசுங்கள்
- அனைத்து கேள்விகளையும் கேளுங்கள் — 
  இந்த கட்டி வகை மிகவும் சிகிச்சைக்குரியது
- பிட்யூட்டரி கட்டி ஆதரவு குழுவில் சேருங்கள்
- தேவைப்படும்போது ஓய்வெடுங்கள்

🗣️ மருத்துவரிடம் சொல்லுங்கள்:
- தொடர்ந்து மிகவும் சோகமாக உணர்ந்தால்
- மனநிலை குறிப்பிடத்தக்க அளவில் 
  மாறியிருந்தால்
- தினமும் மிகவும் கவலையாக உணர்ந்தால்
- தூக்கம் வராவிட்டால்

ஹார்மோன் சிகிச்சை உங்கள் 
மனநிலையை நேரடியாக மேம்படுத்தலாம்.
தொழில்முறை மன நல ஆதரவும் கிடைக்கிறது.

உங்களுக்கு மிகவும் சிகிச்சைக்குரிய 
நிலை உள்ளது.
உங்கள் பராமரிப்பு குழு 
உங்களுடன் இருக்கிறது. 💙`
    ]
  },

  // ── PITUITARY TUMOR GRADE II ──────────────────────────────────────────────
  pituitary_2: {
    meta: {
      name: { en: 'Pituitary Tumor Grade II', si: 'පිටියුටරි ගෙඩිය - ශ්‍රේණිය 2', ta: 'பிட்யூட்டரி கட்டி - தரம் 2' },
      accent: '#c2410c', accentBg: '#fff7ed', icon: 'P2'
    },
    en: [
      `You have a type of growth called a 
Pituitary Tumor. It is Grade 2 — 
also called an Invasive Pituitary 
Adenoma or Macroadenoma.

Grade 2 means the tumor is larger 
(bigger than 10mm) and may be 
growing into nearby structures 
like the bone or surrounding tissue.

This is more complex than Grade 1 
and needs more active treatment.
It is still usually not cancerous 
but needs careful management.

Your doctor has confirmed this 
after careful testing and has 
a treatment plan ready for you.
Your care team is fully 
committed to supporting you.`,
      `Grade 2 Pituitary Tumor usually 
needs active treatment.

💊 MEDICATION FIRST
Some Grade 2 tumors respond 
very well to medication.
Dopamine agonist tablets may 
significantly shrink the tumor 
before surgery is needed.
Always take medicine as prescribed.

🔪 SURGERY
Surgery is usually recommended 
for Grade 2 tumors especially 
if causing vision problems or 
not responding to medicine.
Pituitary surgery is done 
through the nose — 
not through the skull.
Recovery is usually good.

☢️ RADIATION THERAPY
After surgery if any tumor 
remains radiation may be given.
Stereotactic radiosurgery or 
standard radiation may be used.

🔬 HORMONE REPLACEMENT
If surgery affects hormone 
production you may need 
hormone replacement tablets.
These are taken long term.
They are very important — 
never stop without doctor's advice.

Your doctor will explain 
your exact plan clearly.`,
      `🔴 GO TO HOSPITAL RIGHT NOW IF:
- Sudden complete vision loss
- Sudden very severe headache
  (pituitary apoplexy — emergency)
- You lose consciousness
- Sudden confusion or collapse
- Cannot see properly suddenly
- Sudden extreme weakness

🟡 CALL YOUR DOCTOR TODAY IF:
- Vision becoming blurry or 
  tunnel vision developing
- Severe headache getting worse daily
- Sudden hormonal symptoms:
  - Extreme thirst frequent urination
  - Sudden significant weight changes
  - Extreme fatigue suddenly
  - Sudden mood changes
- Feeling very confused
- New weakness in arms or legs

🟢 SYMPTOMS TO MONITOR REGULARLY:
- Any vision changes — 
  even mild ones
- Hormone related symptoms — 
  mood energy weight cycles
- Headache pattern changes
  → Report all at every visit`,
      `Very important questions to ask:

- What type of pituitary tumor is it?
- Is it producing hormones?
- Do I need medicine or surgery first?
- How large is the tumor exactly?
- Is it pressing on my optic nerves?
- How many treatment sessions?
- How often will I have MRI scans?
- Will I need hormone replacement?
- What hormones will be affected?
- Can it affect my vision permanently?
- Will it affect my ability 
  to have children?
- What happens if it comes back?
- Who do I call in an emergency?`,
      `IF TAKING MEDICATION:
🤢 Nausea — common at first
Take with food and at bedtime.
Starts on low dose.

😴 Dizziness
Stand up slowly.
Tell doctor if persistent.

😟 Mood changes — low or anxious
Tell your doctor.
Dose adjustment usually helps.

AFTER SURGERY:
😴 Tiredness — very common
Rest is important.
Recovery takes several weeks.

🤧 Nasal stuffiness or discharge
Normal after nose surgery.
Avoid blowing nose hard.

💧 Excessive thirst or urination
May indicate diabetes insipidus.
Tell your doctor immediately.
Treatment is available.

🧠 Memory or thinking changes
Usually temporary.
Improves with time.

💊 HORMONE CHANGES AFTER SURGERY
If pituitary function is affected:
Cortisol deficiency — 
important to replace
Thyroid hormone changes
Growth hormone changes
These are all manageable 
with appropriate replacement.

⚠️ VERY IMPORTANT:
If you take cortisol replacement:
Never stop this medicine suddenly
In illness or stress take 
double dose — ask doctor
Always carry a steroid 
emergency card

Your care team will guide 
you through all of this carefully.`,
      `Good nutrition is very important 
especially if hormones are affected.

✅ GOOD FOODS:
- Balanced meals — 
  rice bread vegetables protein
- Calcium and vitamin D rich — 
  milk curd cheese sunlight
  (very important for bones 
  if cortisol or growth hormone 
  is affected)
- High protein — fish eggs 
  chicken lentils
- Iron rich — fish eggs 
  green vegetables
- Drink plenty of water

❌ AVOID:
- Alcohol — especially if 
  on hormonal medication
- Very salty food — 
  if blood pressure affected
- Excessive sugar — 
  especially if cortisol 
  levels are being managed
- Excessive caffeine

🥤 IF APPETITE OR WEIGHT IS AFFECTED:
- Small frequent meals
- Track weight weekly
- Tell doctor about 
  significant weight changes

⚠️ NOTE:
Pituitary Grade 2 can significantly 
affect your metabolism and hormones.
A specialist dietitian review 
is strongly recommended.
Ask your doctor to arrange this.`,
      `A Grade 2 Pituitary Tumor brings 
unique emotional challenges because 
hormonal changes directly affect 
your mood brain and energy.

You may feel:
- Anxious or overwhelmed
- Unusually sad or depressed — 
  often partly hormonal
- Frustrated with ongoing treatment
- Worried about vision or 
  hormone changes
- Uncertain about the future
- Tired in ways that feel 
  different from before

💙 THINGS THAT GENUINELY HELP:
- Understand that your mood 
  and energy changes may be 
  directly hormonal — 
  not a weakness
- Talk openly with family 
  and your care team about 
  how you are really feeling
- Join a pituitary tumor 
  support group — 
  others understand exactly 
  what you are going through
- Rest without guilt — 
  hormonal fatigue is real
- Do small activities 
  that bring you joy
- Hormone treatment may 
  directly improve how you feel

🗣️ PLEASE TELL YOUR DOCTOR IF:
- You feel persistently very sad
- Your mood has changed significantly
- You feel very anxious every day
- You cannot sleep or function
- You feel hopeless or worthless
- You feel your personality 
  has changed

Some of these symptoms may be 
directly caused by hormone 
imbalances and can improve 
with correct hormone treatment.

Professional mental health support 
is also available alongside 
medical treatment.

You are dealing with something 
complex and real.
Your feelings are completely valid.
Your care team is fully 
committed to your wellbeing — 
body mind and hormones. 💙`
    ],
    si: [
      `ඔබේ මොළයේ පිටියුටරි 
ගෙඩියක් ඇති බව 
සොයාගෙන ඇත.
ශ්‍රේණිය 2 — ආක්‍රමණකාරී 
පිටියුටරි ඇඩෙනෝමා හෝ 
මැක්‍රෝඇඩෙනෝමා ලෙසද 
හැඳින්වේ.

ශ්‍රේණිය 2 යනු ගෙඩිය 
විශාල (10mm ට වඩා 
විශාල) සහ ඔස්සේ 
ඇටකටු හෝ 
අවටති හා 
ආශ්‍රිත ව්‍යුහ 
වෙත වර්ධනය 
විය හැකිය.

මෙය ශ්‍රේණිය 1 ට 
වඩා සංකීර්ණ 
සහ වඩා 
ක්‍රියාශීලී 
ප්‍රතිකාරයක් 
අවශ්‍ය කරයි.
සාමාන්‍යයෙන් 
තවමත් 
පිළිකාවක් 
නොවේ 
නමුත් 
සූක්ෂ්ම 
කළමනාකරණය 
අවශ්‍ය වේ.

ඔබේ 
වෛද්‍යවරයා 
සූක්ෂ්ම 
පරීක්ෂාවෙන් 
පසු 
මෙය 
තහවුරු 
කර 
ඔබ 
සඳහා 
ප්‍රතිකාර 
සැලැස්මක් 
සකස් 
කර ඇත.
ඔබේ 
රැකවරණ 
කණ්ඩායම 
ඔබව 
සහය 
කිරීමට 
සම්පූර්ණයෙන්ම 
කැපවී 
සිටී.`,
      `ශ්‍රේණිය 2 
පිටියුටරි 
ගෙඩිය 
සාමාන්‍යයෙන් 
ක්‍රියාශීලී 
ප්‍රතිකාරයක් 
අවශ්‍ය කරයි.

💊 ප්‍රථමයෙන් 
   ඖෂධ
සමහර 
ශ්‍රේණිය 2 
ගෙඩි 
ඖෂධ 
වලට 
ඉතා 
හොඳින් 
ප්‍රතිචාර 
දක්වයි.
ශල්‍යකර්මය 
අවශ්‍ය 
වීමට 
පෙර 
ගෙඩිය 
සැලකිය 
යුතු 
ලෙස 
කුඩා 
කළ 
හැකිය.

🔪 ශල්‍යකර්මය
ශ්‍රේණිය 2 
ගෙඩි 
සඳහා 
විශේෂයෙන් 
දෘෂ්ටි 
ගැටළු 
ඇති 
කරන්නේ 
නම් 
හෝ 
ඖෂධ 
වලට 
ප්‍රතිචාර 
නොදක්වන්නේ 
නම් 
ශල්‍යකර්මය 
සාමාන්‍යයෙන් 
නිර්දේශ 
කෙරේ.
නාසය 
හරහා 
සිදු 
කෙරේ.

☢️ විකිරණ 
   ප්‍රතිකාරය
ශල්‍යකර්මයෙන් 
පසු 
ගෙඩිය 
ඉතිරි 
නම් 
විකිරණ 
දෙනු 
ලැබිය 
හැකිය.

🔬 හෝමෝන 
   ප්‍රතිස්ථාපනය
ශල්‍යකර්මය 
හෝමෝන 
නිෂ්පාදනය 
බලපාන්නේ 
නම් 
හෝමෝන 
ප්‍රතිස්ථාපන 
ටැබ්ලට් 
අවශ්‍ය 
විය 
හැකිය.
ඒවා 
දිගු 
කාලීනව 
ගනු 
ලැබේ.
ඒවා 
ඉතා 
වැදගත් — 
වෛද්‍යවරයාගේ 
උපදෙස් 
නොමැතිව 
නොනවත්වන්න.`,
      `🔴 දැන්ම රෝහලට යන්න:
- හදිසි 
  සම්පූර්ණ 
  දෘෂ්ටි喪失
- හදිසි ඉතා 
  දරුණු හිසරදය
  (පිටියුටරි 
  ඇපොප්ලෙක්සි — 
  හදිසි 
  අවස්ථාවකි)
- ඥානය නැතිවීම
- හදිසි 
  ව්‍යාකූලතාවය 
  හෝ 
  ඇද වැටීම
- හදිසි 
  දරුණු 
  දුර්වලතාවය

🟡 අද වෛද්‍යවරයාට 
   කතා කරන්න:
- දෑස් 
  අපැහැදිලි 
  වීම 
  හෝ 
  ශ්‍රේය 
  දෘෂ්ටිය
- දිනෙන් 
  දින 
  නරක් 
  වන 
  දරුණු 
  හිසරදය
- හදිසි 
  හෝමෝනල් 
  රෝග ලක්ෂණ
- ඉතා 
  ව්‍යාකූල 
  දැනීම
- නව 
  දුර්වලතාවය

🟢 නිතිපතා 
   නිරීක්ෂණය 
   කළ 
   යුතු:
- ඕනෑම 
  දෘෂ්ටි 
  වෙනස්කම් — 
  මෘදු ඒවා 
  පවා
- හෝමෝනල් 
  රෝග ලක්ෂණ
- හිසරදය 
  රටාව 
  වෙනස්කම්
  → සෑම 
    හමුවකදීම 
    වාර්තා 
    කරන්න`,
      `අහන්න
ඉතා වැදගත් 
ප්‍රශ්න:

- පිටියුටරි 
  ගෙඩිය 
  කුමන 
  වර්ගයේද?
- හෝමෝන 
  නිෂ්පාදනය 
  කරනවාද?
- ප්‍රථමයෙන් 
  ඖෂධ 
  නැතිනම් 
  ශල්‍යකර්මමද?
- ගෙඩිය 
  හරියටම 
  කොතරම් 
  විශාලද?
- ප්‍රත්‍ක්ෂ 
  ස්නායු 
  මත 
  පීඩනය 
  ඇතිද?
- ප්‍රතිකාර 
  සැසි 
  කීයක්ද?
- MRI 
  පරීක්ෂා 
  කොපමණ 
  කාලයකට 
  වරක්ද?
- හෝමෝන 
  ප්‍රතිස්ථාපනය 
  අවශ්‍ය 
  වේද?
- කුමන 
  හෝමෝන 
  බලපෑමට 
  ලක් 
  වේද?
- දෘෂ්ටිය 
  ස්ථිරවම 
  බලපාන 
  ලදිද?
- දරු 
  ලැබීමේ 
  හැකියාව 
  බලපාන 
  ලදිද?`,
      `බලපෑම්
ඖෂධ 
ගන්නවා නම්:
🤢 ඔක්කාරය — 
   ආරම්භයේදී 
   සාමාන්‍යයි
රාත්‍රී 
ආහාර 
සමඟ 
ගන්න.

😴 කරකැවිල්ල
සෙමෙන් 
නැගිටින්න.

😟 මනෝභාවය 
   වෙනස්කම්
ඔබේ 
වෛද්‍යවරයාට 
කියන්න.

ශල්‍යකර්මයෙන් 
පසු:
😴 තෙහෙට්ටුව — 
   ඉතාම 
   සාමාන්‍යයි
සතිවල් 
ගණනක් 
සුවය 
ලැබීම 
ගනී.

🤧 නාසය 
   හිරවීම 
   හෝ 
   ස්‍රාවය
නාසය 
ශල්‍යකර්මයෙන් 
පසු 
සාමාන්‍යයි.

💧 අධික 
   පිපාසය 
   හෝ 
   මූත්‍රා
ඩයබිටීස් 
ඉන්සිපිඩස් 
ලකුණක් 
විය හැකිය.
වහාම 
වෛද්‍යවරයාට 
කියන්න.

💊 ශල්‍යකර්මයෙන් 
   පසු 
   හෝමෝන 
   වෙනස්කම්
කෝටිසෝල් 
ඌනතාවය — 
ප්‍රතිස්ථාපනය 
ඉතා 
වැදගත්
තයිරොයිඩ් 
හෝමෝන 
වෙනස්කම්
⚠️ ඉතා 
   වැදගත්:
කෝටිසෝල් 
ප්‍රතිස්ථාපනය 
ගන්නවා නම් 
කිසිසේත් 
හදිසියේ 
නොනවත්වන්න
රෝගාතුර 
නම් 
ස්ටෙරොයිඩ් 
හදිසි 
කාඩ්පත 
සෑම 
විටම 
රැගෙන 
යන්න`,
      `පෝෂණය
හෝමෝන 
බලපෑමෙන් 
තිබේ නම් 
හොඳ 
පෝෂණය 
ඉතා 
වැදගත්.

✅ හොඳ 
   ආහාර:
- සමබර 
  ආහාර
- කැල්සියම් 
  සහ 
  විටමින් D — 
  කිරි, 
  දෝ, 
  සූර්ය 
  ආලෝකය
  (ඇටකටු 
  ශක්තිය 
  සඳහා 
  ඉතා 
  වැදගත්)
- ඉහළ 
  ප්‍රෝටීන් — 
  මාළු, 
  බිත්තර
- යකඩ 
  බහුල — 
  කොළ 
  එළවළු
- ජලය 
  ප්‍රමාණවත් 
  ලෙස 
  බොන්න

❌ වළකින්න:
- මත්පැන්
- ඉතාම 
  ලුණු 
  ආහාර
- අධික 
  සීනි — 
  කෝටිසෝල් 
  කළමනාකරණය 
  කරන්නේ නම්
- අධික 
  කැෆේන්

⚠️ සටහන:
ශ්‍රේණිය 2 
පිටියුටරි 
ගෙඩිය 
ඔබේ 
පරිවෘත්තිය 
සහ 
හෝමෝන 
සැලකිය 
යුතු 
ලෙස 
බලපෑමට 
ලක් 
කළ 
හැකිය.
විශේෂඥ 
ආහාරවේදී 
ඇගයීමක් 
ශක්තිමත් 
ලෙස 
නිර්දේශ 
කෙරේ.`,
      `ශ්‍රේණිය 2 
පිටියුටරි 
ගෙඩිය 
හෝමෝනල් 
වෙනස්කම් 
ඔබේ 
මනෝභාවය 
මොළය 
සහ 
ශක්තිය 
කෙලින්ම 
බලපාන 
නිසා 
අද්විතීය 
සංවේදී 
අභියෝග 
ගෙනෙයි.

ඔබට 
දැනිය 
හැකිය:
- කනස්සල්ල 
  හෝ 
  ගිලෙනා 
  දැනීමක්
- අසාමාන්‍ය 
  ලෙස 
  දුක් 
  හෝ 
  පහත් — 
  බොහෝ 
  විට 
  හෝමෝනල්
- දෘෂ්ටිය 
  හෝ 
  හෝමෝන 
  ගැන 
  කනස්සල්ල
- ශ්‍රාන්තිය 
  වෙනස් 
  ලෙස 
  දැනෙනවා

💙 ඇත්තටම 
   උදව් 
   වන දේ:
- ඔබේ 
  මනෝභාවය 
  හෝ 
  ශක්තිය 
  වෙනස්කම් 
  හෝමෝනල් 
  විය 
  හැකිය 
  — 
  දුර්වලතාවයක් 
  නොවේ 
  යන්න 
  තේරුම් 
  ගන්න
- පවුල 
  සහ 
  රැකවරණ 
  කණ්ඩායම 
  සමඟ 
  ඔබ 
  ඇත්තටම 
  දැනෙන 
  දේ 
  ගැන 
  විවෘතව 
  කතා කරන්න
- හෝමෝන 
  ප්‍රතිකාරය 
  ඔබේ 
  දැනෙන 
  ආකාරය 
  කෙලින්ම 
  වැඩිදියුණු 
  කළ හැකිය

🗣️ ඔබේ 
   වෛද්‍යවරයාට 
   කියන්න:
- දිගු 
  කාලයක් 
  ඉතා 
  දුකක් 
  දැනෙනවා නම්
- මනෝභාවය 
  සැලකිය 
  යුතු 
  ලෙස 
  වෙනස් 
  වී ඇත්නම්
- දිනෙන් 
  දින 
  ඉතා 
  කනස්සල්ලෙන් 
  දැනෙනවා නම්
- ඔබේ 
  පෞරුෂය 
  වෙනස් 
  වී ඇති 
  බව 
  දැනෙනවා නම්

මෙම 
රෝග 
ලක්ෂණ 
සමහරක් 
හෝමෝන 
ස්ථිතික 
නොවීමෙන් 
කෙලින්ම 
ඇති 
වන 
නිසා 
නිවැරදි 
හෝමෝන 
ප්‍රතිකාරයෙන් 
හොඳ 
විය 
හැකිය.

ඔබ 
ජය 
ගත 
හැකිය. 💙`
    ],
    ta: [
      `உங்கள் மூளையில் பிட்யூட்டரி 
கட்டி இருப்பதை கண்டுபிடித்துள்ளார்.
தரம் 2 — ஆக்கிரமிப்பு பிட்யூட்டரி 
அடினோமா அல்லது மேக்ரோஆடினோமா 
என்றும் அழைக்கப்படுகிறது.

தரம் 2 என்பது கட்டி பெரியதாக 
(10mm க்கும் பெரியது) இருக்கிறது 
மற்றும் எலும்பு அல்லது சுற்றிலுள்ள 
திசுக்கள் போன்ற அருகிலுள்ள 
கட்டமைப்புகளில் வளர்கிறது.

இது தரம் 1 ஐ விட சிக்கலானது 
மற்றும் மிகவும் தீவிரமான 
சிகிச்சை தேவைப்படுகிறது.
இது பொதுவாக இன்னும் 
புற்றுநோயல்ல ஆனால் 
கவனமான மேலாண்மை தேவை.

உங்கள் மருத்துவர் கவனமான 
சோதனைக்கு பிறகு இதை உறுதிப்படுத்தி 
உங்களுக்காக சிகிச்சை திட்டம் 
தயார் செய்துள்ளார்.
உங்கள் பராமரிப்பு குழு 
உங்களை ஆதரிக்க முழுமையாக 
அர்ப்பணித்துள்ளது.`,
      `தரம் 2 பிட்யூட்டரி கட்டிக்கு 
பொதுவாக தீவிர சிகிச்சை தேவை.

💊 முதலில் மருந்து
சில தரம் 2 கட்டிகள் 
மருந்துகளுக்கு மிகவும் நன்றாக 
பதிலளிக்கின்றன.
டோபமைன் அகோனிஸ்ட் மாத்திரைகள் 
அறுவை சிகிச்சை தேவைப்படுவதற்கு 
முன் கட்டியை குறிப்பிடத்தக்க 
அளவில் சுருக்கலாம்.

🔪 அறுவை சிகிச்சை
தரம் 2 கட்டிகளுக்கு குறிப்பாக 
பார்வை பிரச்சனைகளை ஏற்படுத்தினால் 
அல்லது மருந்துக்கு பதில் தராவிட்டால் 
அறுவை சிகிச்சை பொதுவாக பரிந்துரைக்கப்படுகிறது.
மூக்கு வழியாக செய்யப்படுகிறது.

☢️ கதிர்வீச்சு சிகிச்சை
அறுவை சிகிச்சைக்கு பிறகு 
கட்டி மிச்சமிருந்தால் 
கதிர்வீச்சு தரப்படலாம்.

🔬 ஹார்மோன் மாற்று சிகிச்சை
அறுவை சிகிச்சை ஹார்மோன் 
உற்பத்தியை பாதித்தால் 
ஹார்மோன் மாற்று மாத்திரைகள் 
தேவைப்படலாம்.
இவை நீண்ட காலம் எடுக்கப்படுகின்றன.
இவை மிகவும் முக்கியம் — 
மருத்துவரின் ஆலோசனை இல்லாமல் 
நிறுத்தாதீர்கள்.

உங்கள் சரியான திட்டத்தை 
மருத்துவர் தெளிவாக விளக்குவார்.`,
      `🔴 இப்போதே மருத்துவமனைக்கு செல்லுங்கள்:
- திடீர் முழுமையான பார்வை இழப்பு
- திடீர் மிகவும் கடுமையான தலைவலி
  (பிட்யூட்டரி அபோப்ளெக்ஸி — அவசரநிலை)
- நனவு இழப்பு
- திடீர் குழப்பம் அல்லது சரிவு
- திடீரென்று சரியாக பார்க்க முடியாமல் போவது
- திடீர் தீவிர பலவீனம்

🟡 இன்றே மருத்துவரை அழையுங்கள்:
- பார்வை மங்கலாவது அல்லது 
  குகை பார்வை உருவாவது
- தினமும் மோசமாகும் கடுமையான தலைவலி
- திடீர் ஹார்மோன் அறிகுறிகள்
- மிகவும் குழப்பமான உணர்வு
- கைகள் கால்களில் புதிய பலவீனம்

🟢 தொடர்ந்து கண்காணிக்க வேண்டியவை:
- எந்த பார்வை மாற்றங்களும் — 
  மிதமான ஒன்றும் கூட
- ஹார்மோன் தொடர்பான அறிகுறிகள்
- தலைவலி வடிவ மாற்றங்கள்
  → ஒவ்வொரு சந்திப்பிலும் தெரிவிக்கவும்`,
      `மிகவும் முக்கியமான கேள்விகள்:

- பிட்யூட்டரி கட்டி என்ன வகை?
- ஹார்மோன்களை உற்பத்தி செய்கிறதா?
- முதலில் மருந்தா அல்லது அறுவை சிகிச்சையா?
- கட்டி சரியாக எவ்வளவு பெரியது?
- என் ஆப்டிக் நரம்புகளில் அழுத்தம் கொடுக்கிறதா?
- எத்தனை சிகிச்சை அமர்வுகள்?
- எத்தனை காலத்திற்கு ஒரு முறை MRI?
- ஹார்மோன் மாற்று சிகிச்சை தேவைப்படுமா?
- என்ன ஹார்மோன்கள் பாதிக்கப்படும்?
- பார்வையை நிரந்தரமாக பாதிக்குமா?
- குழந்தை பெற்றுக்கொள்ளும் திறனை பாதிக்குமா?
- மீண்டும் வந்தால் என்ன நடக்கும்?`,
      `மருந்து எடுத்தால்:
🤢 குமட்டல் — ஆரம்பத்தில் பொதுவானது
இரவு உணவுடன் படுக்கும் நேரத்தில் எடுங்கள்.

😴 தலைசுற்றல்
மெதுவாக எழுந்திருங்கள்.

😟 மனநிலை மாற்றங்கள்
மருத்துவரிடம் சொல்லுங்கள்.

அறுவை சிகிச்சைக்கு பிறகு:
😴 சோர்வு — மிகவும் இயல்பானது
வாரங்களாக குணமடைவதற்கு நேரம் ஆகும்.

🤧 மூக்கு அடைப்பு அல்லது சுரப்பு
மூக்கு அறுவை சிகிச்சைக்கு பிறகு இயல்பானது.

💧 அதிக தாகம் அல்லது சிறுநீர்
டயாபடீஸ் இன்சிபிடஸ் அறிகுறியாக இருக்கலாம்.
உடனே மருத்துவரிடம் சொல்லுங்கள்.

💊 அறுவை சிகிச்சைக்கு பிறகு ஹார்மோன் மாற்றங்கள்
கார்டிசோல் குறைபாடு — மாற்று சிகிச்சை முக்கியம்
தைராய்டு ஹார்மோன் மாற்றங்கள்
⚠️ மிகவும் முக்கியம்:
கார்டிசோல் மாற்று சிகிச்சை எடுத்தால் 
திடீரென்று நிறுத்தாதீர்கள்
நோய்வாய்ப்பட்டால் ஸ்டீராய்டு 
அவசர அட்டையை எப்போதும் 
வைத்திருங்கள்`,
      `ஹார்மோன்கள் பாதிக்கப்பட்டால் 
நல்ல ஊட்டச்சத்து மிகவும் முக்கியம்.

✅ நல்ல உணவுகள்:
- சமச்சீரான உணவுகள்
- கால்சியம் மற்றும் வைட்டமின் D — 
  பால் தயிர் பனீர் சூரிய ஒளி
  (எலும்பு ஆரோக்கியத்திற்கு மிகவும் முக்கியம்)
- அதிக புரதம் — மீன் முட்டை கோழி
- இரும்புச் சத்து நிறைந்தவை — 
  பச்சை காய்கறிகள்
- போதுமான தண்ணீர் குடியுங்கள்

❌ தவிர்க்க வேண்டியவை:
- மது — குறிப்பாக ஹார்மோன் மருந்து எடுத்தால்
- மிகவும் உப்பு உணவு
- அதிக சர்க்கரை — 
  கார்டிசோல் நிர்வகிக்கப்படுகிறது என்றால்
- அதிக காஃபின்

⚠️ குறிப்பு:
தரம் 2 பிட்யூட்டரி கட்டி உங்கள் 
வளர்சிதை மாற்றம் மற்றும் 
ஹார்மோன்களை குறிப்பிடத்தக்க 
அளவில் பாதிக்கலாம்.
சிறப்பு உணவியல் நிபுணர் 
மதிப்பீடு மிகவும் பரிந்துரைக்கப்படுகிறது.
மருத்துவரிடம் கேளுங்கள்.`,
      `தரம் 2 பிட்யூட்டரி கட்டி 
ஹார்மோன் மாற்றங்கள் உங்கள் 
மனநிலை மூளை மற்றும் 
ஆற்றலை நேரடியாக பாதிப்பதால் 
தனித்துவமான உணர்வு சவால்களை 
கொண்டு வருகிறது.

உணரலாம்:
- கவலை அல்லது மூழ்கிப்போவது போல் உணர்வு
- வழக்கத்திற்கு மாறாக சோகமாக 
  அல்லது மனச்சோர்வாக — 
  பெரும்பாலும் ஓரளவு ஹார்மோனல்
- தொடர்ந்த சிகிச்சையில் விரக்தி
- பார்வை அல்லது ஹார்மோன் மாற்றங்கள் 
  பற்றிய கவலை
- முன்பை விட வித்தியாசமாக சோர்வாக உணர்வது

💙 உண்மையிலேயே உதவக்கூடியவை:
- உங்கள் மனநிலை மற்றும் 
  ஆற்றல் மாற்றங்கள் நேரடியாக 
  ஹார்மோனல் ஆக இருக்கலாம் — 
  பலவீனம் அல்ல என்று புரிந்துகொள்ளுங்கள்
- குடும்பத்தினர் மற்றும் 
  பராமரிப்பு குழுவிடம் 
  உண்மையிலேயே எப்படி உணர்கிறீர்கள் 
  என்று திறந்து பேசுங்கள்
- பிட்யூட்டரி கட்டி ஆதரவு குழுவில் சேருங்கள்
- குற்ற உணர்வின்றி ஓய்வெடுங்கள் — 
  ஹார்மோனல் சோர்வு உண்மையானது
- ஹார்மோன் சிகிச்சை நேரடியாக 
  உங்கள் உணர்வை மேம்படுத்தலாம்

🗣️ மருத்துவரிடம் சொல்லுங்கள்:
- தொடர்ந்து மிகவும் சோகமாக உணர்ந்தால்
- மனநிலை குறிப்பிடத்தக்க அளவில் மாறியிருந்தால்
- தினமும் மிகவும் கவலையாக உணர்ந்தால்
- தூக்கம் வராவிட்டால் அல்லது 
  சரியாக செயல்பட முடியாவிட்டால்
- உங்கள் ஆளுமை மாறியதாக உணர்ந்தால்

இந்த அறிகுறிகளில் சில ஹார்மோன் 
சமநிலையின்மையால் நேரடியாக 
ஏற்படலாம் மற்றும் சரியான 
ஹார்மோன் சிகிச்சையால் மேம்படலாம்.

நீங்கள் சிக்கலான மற்றும் 
உண்மையான ஒன்றை சமாளிக்கிறீர்கள்.
உங்கள் உணர்வுகள் முற்றிலும் சரியானவை.
உங்கள் பராமரிப்பு குழு 
உங்கள் நலனுக்காக முழுமையாக 
அர்ப்பணித்துள்ளது — 
உடல் மனம் மற்றும் ஹார்மோன்கள். 💙`
    ]
  },

  // ── NO TUMOR DETECTED ──────────────────────────────────────────────
  no_tumor: {
    meta: {
      name: { en: 'No Tumor Detected', si: 'ගෙඩියක් හඳුනා නොගැනීම', ta: 'கட்டி இல்லை' },
      accent: '#16a34a', accentBg: '#f0fdf4', icon: 'NT'
    },
    en: [
      `Your brain scan has been carefully 
reviewed by your doctor.

Good news — no tumor was found 
in your brain scan.

This is a very reassuring result.
It means the scan did not show 
any abnormal growth in your brain.

Your doctor may have ordered 
this scan because of symptoms 
you were experiencing.
Even though no tumor was found 
your symptoms are real and 
your doctor will continue 
to investigate and support you.

You are in good hands and 
your care team is here for you.`,
      `Since no tumor was found 
there is no tumor-specific 
treatment needed.

However your doctor will:

👁️ CONTINUE MONITORING
Follow up appointments to 
check on your symptoms.
Further tests if needed.

💊 SYMPTOM MANAGEMENT
If you have symptoms your 
doctor will investigate the cause 
and provide appropriate treatment.
Never ignore symptoms — 
always report them.

🧠 FURTHER INVESTIGATION
If your symptoms continue 
your doctor may order:
Additional MRI scans
Other neurological tests
Blood tests or other investigations

🩺 REGULAR CHECKUPS
Even with no tumor found 
regular checkups are important 
to monitor your overall brain health.

Always attend your follow up 
appointments even if you feel well.
Report any new symptoms 
to your doctor promptly.`,
      `Even without a tumor diagnosis 
you should watch for these signs:

🔴 GO TO HOSPITAL RIGHT NOW IF:
- Seizure or body shaking
- Sudden severe headache 
  unlike any before
- Cannot speak suddenly
- One side of body goes weak
- You lose consciousness
- Sudden vision changes

🟡 CALL YOUR DOCTOR TODAY IF:
- Headache getting progressively worse
- New neurological symptoms develop
- Vision changes
- Memory or thinking problems worsen
- Feeling confused more often
- Any new symptoms you have 
  not had before

🟢 KEEP MONITORING:
- Note any new or worsening symptoms
- Keep a symptom diary if helpful
- Attend all follow up appointments
- Report changes at every visit`,
      `Good questions to ask:

- Why did I have symptoms if 
  there is no tumor?
- Do I need any further tests?
- When will I have my 
  next follow up?
- Do I need another MRI scan?
- What symptoms should 
  worry me in the future?
- Is there anything else 
  that could explain my symptoms?
- Do I need to see a 
  specialist neurologist?
- Can I drive and work normally?
- What lifestyle changes 
  would help my brain health?`,
      `Since no tumor was found and 
no tumor treatment is being given 
there are no treatment side effects 
to worry about.

However if you experienced 
any tests or procedures:

AFTER MRI SCAN:
No side effects from MRI itself ✅
The scan uses magnets — 
no radiation involved.

AFTER CONTRAST DYE INJECTION:
Mild headache — normal
Nausea — usually passes quickly
Allergic reaction — rare but 
tell doctor if skin rash 
or breathing difficulty

GENERAL WELLBEING:
😴 If you feel tired — rest well
🧠 If you feel anxious about 
   the results — this is normal
   Talk to your care team

Remember — a clear scan 
is genuinely good news.
Your care team will continue 
to support you with any 
ongoing symptoms.`,
      `Even without a tumor a healthy 
diet supports your brain health 
and overall wellbeing.

✅ BRAIN HEALTHY FOODS:
- Oily fish — salmon mackerel 
  sardines (2 portions per week)
  Omega 3 for brain health
- Leafy green vegetables — 
  spinach kale green leaves
- Colorful fruits and berries — 
  antioxidants for brain health
- Nuts and seeds — 
  walnuts almonds especially good
- Whole grains — 
  brown rice oats wholemeal bread
- Olive oil or coconut oil
- Drink 8 glasses of water daily

❌ LIMIT THESE:
- Very processed food
- Excessive sugar
- Alcohol — limit significantly
- Too much salt
- Fried and oily food regularly

💡 BRAIN HEALTH LIFESTYLE TIPS:
- Regular gentle exercise — 
  even walking 30 minutes daily
- Good quality sleep — 
  7 to 8 hours
- Manage stress — 
  meditation yoga breathing
- Stay socially connected
- Keep your mind active — 
  reading puzzles learning

These habits support long term 
brain health and overall wellbeing.`,
      `Waiting for brain scan results is very stressful and anxious. Receiving a no tumor result can bring many mixed emotions.

You may feel:
- Relieved and grateful
- But still worried. Why do I still have symptoms?
- Confused about what is causing your symptoms
- Frustrated if symptoms continue
- Sometimes not fully believed by others about your symptoms

All of these feelings are completely valid and normal.

💙 THINGS THAT HELP:
- Celebrate the good news. No tumor is genuinely wonderful news
- Talk openly with your doctor about ongoing symptoms. They believe you
- Do not suffer symptoms in silence. Keep reporting them
- Take care of your mental health as well as your physical health
- Rest when you need to
- Do activities that bring you joy and peace

🗣️ TELL YOUR DOCTOR IF:
- You feel very anxious despite the clear result
- Your symptoms are significantly affecting your daily life
- You feel depressed or hopeless
- You cannot sleep from worry
- You feel your quality of life is poor despite a clear scan

Your symptoms are real and deserve proper investigation. A clear brain scan is very good news but it does not mean your symptoms are not real or important.

Your care team is here to keep supporting you. You are not alone. 💙`
    ],
    si: [
      `ඔබේ මොළ ස්කෑනය 
ඔබේ වෛද්‍යවරයා 
සූක්ෂ්මව 
සමාලෝකනය 
කර ඇත.

සුභ ආරංචිය — 
ඔබේ මොළ 
ස්කෑනයේ 
ගෙඩියක් 
හමු 
නොවීය.

මෙය ඉතා 
සහතිකිය 
ජනකෝ 
ප්‍රතිඵලයකි.
ස්කෑනය 
ඔබේ 
මොළයේ 
අසාමාන්‍ය 
වර්ධනයක් 
නොපෙන්වයි.

ඔබ 
අත්විඳිය 
රෝග 
ලක්ෂණ 
නිසා 
ඔබේ 
වෛද්‍යවරයා 
මෙම 
ස්කෑනය 
නියෝග 
කළ 
හැකිය.
ගෙඩියක් 
නොහමු 
වුවත් 
ඔබේ 
රෝග 
ලක්ෂණ 
සැබෑ 
ය 
සහ 
ඔබේ 
වෛද්‍යවරයා 
දිගටම 
ඔබව 
විමර්ශනය 
කර 
සහය 
කරනු 
ඇත.

ඔබ 
හොඳ 
අතේ 
සිටී 
සහ 
ඔබේ 
රැකවරණ 
කණ්ඩායම 
ඔබ 
සඳහා 
මෙහි 
සිටී.`,
      `ගෙඩියක් 
නොහමු 
වූ 
නිසා 
ගෙඩි 
විශේෂිත 
ප්‍රතිකාරයක් 
අවශ්‍ය 
නොවේ.

කෙසේ 
වෙතත් 
ඔබේ 
වෛද්‍යවරයා:

👁️ නිරීක්ෂණය 
   දිගටම 
   කරනු ඇත
ඔබේ 
රෝග 
ලක්ෂණ 
පරීක්ෂා 
කිරීමට 
හමු 
වීම් 
දිගටම 
කෙරේ.
අවශ්‍ය 
නම් 
තවත් 
පරීක්ෂා.

💊 රෝග 
   ලක්ෂණ 
   කළමනාකරණය
රෝග 
ලක්ෂණ 
ඇත්නම් 
ඔබේ 
වෛද්‍යවරයා 
හේතුව 
විමර්ශනය 
කර 
නිසි 
ප්‍රතිකාරය 
ලබා 
දෙනු 
ඇත.
රෝග 
ලක්ෂණ 
කිසිසේත් 
නොසලකා 
නොහරින්න — 
සෑම 
විටම 
වාර්තා 
කරන්න.

🧠 තවදුරටත් 
   විමර්ශනය
රෝග 
ලක්ෂණ 
දිගටම 
ඇත්නම් 
ඔබේ 
වෛද්‍යවරයා 
නියෝග 
කළ 
හැකිය:
අතිරේක 
MRI 
ස්කෑන්
අනෙකුත් 
ස්නායු 
විද්‍යාත්මක 
පරීක්ෂා
රුධිර 
පරීක්ෂා

🩺 නිත්‍ය 
   පරීක්ෂා
ගෙඩියක් 
නොහමු 
වුවත් 
ඔබේ 
මොළ 
සෞඛ්‍යය 
නිරීක්ෂණය 
කිරීමට 
නිත්‍ය 
පරීක්ෂා 
වැදගත්.`,
      `ගෙඩි 
රෝග 
විනිශ්චයක් 
නොමැතිව 
පවා 
මෙම 
ලකුණු 
සඳහා 
සූදානම් 
ව සිටින්න:

🔴 දැන්ම 
   රෝහලට 
   යන්න:
- ආයාසය 
  හෝ 
  ශරීරය 
  කම්පා 
  වීම
- ඊට 
  පෙර 
  නොවූ 
  හදිසි 
  දරුණු 
  හිසරදය
- හදිසියේ 
  කතා 
  කිරීමට 
  නොහැකි 
  වීම
- ශරීරයේ 
  එක් 
  පැත්තක් 
  දුර්වල 
  වීම
- ඥානය 
  නැතිවීම
- හදිසි 
  දෘෂ්ටි 
  වෙනස්කම්

🟡 අද 
   වෛද්‍යවරයාට 
   කතා 
   කරන්න:
- ක්‍රමයෙන් 
  නරක් 
  වන 
  හිසරදය
- නව 
  ස්නායු 
  ලක්ෂණ
- දෘෂ්ටි 
  වෙනස්කම්
- මතකය 
  හෝ 
  සිතීමේ 
  ගැටළු 
  නරක් 
  වීම
- ඔබ 
  කලින් 
  නොතිබූ 
  ඕනෑම 
  නව 
  රෝග 
  ලක්ෂණ

🟢 නිරීක්ෂණය 
   කරන්න:
- නව 
  හෝ 
  නරක් 
  වන 
  රෝග 
  ලක්ෂණ 
  සටහන් 
  කරන්න
- රෝග 
  ලක්ෂණ 
  දිනපොතක් 
  තබා 
  ගන්න
- සෑම 
  හමු 
  වීමකදීම 
  වෙනස්කම් 
  වාර්තා 
  කරන්න`,
      `අහන්න
හොඳ 
ප්‍රශ්න:

- ගෙඩියක් 
  නොමැතිව 
  ඇයි 
  රෝග 
  ලක්ෂණ 
  ඇතිවීද?
- තවත් 
  පරීක්ෂා 
  අවශ්‍යද?
- ඊළඟ 
  හමු 
  වීම 
  කවදාද?
- තවත් 
  MRI 
  ස්කෑනයක් 
  අවශ්‍යද?
- 앞으로 
  කුමන 
  රෝග 
  ලක්ෂණ 
  කනස්සල්ලට 
  හේතු 
  විය 
  යුතුද?
- මගේ 
  රෝග 
  ලක්ෂණ 
  ව්‍යාඛ්‍යා 
  කළ 
  හැකි 
  වෙනත් 
  දෙයක් 
  ඇතිද?
- ස්නායු 
  රෝග 
  විශේෂඥයෙකු 
  හමුවිය 
  යුතුද?
- රිය 
  පැදවිය 
  හැකිද?
- මොළ 
  සෞඛ්‍යයට 
  ජීවන 
  රටාව 
  වෙනස්කම් 
  කළ 
  යුතුද?`,
      `බලපෑම්
ගෙඩියක් 
නොහමු 
වූ 
නිසා 
ගෙඩි 
ප්‍රතිකාර 
නොලැබේ — 
ප්‍රතිකාර 
අතුරු 
ආබාධ 
ගැන 
කනස්සල්ල 
නොවේ.

MRI 
ස්කෑනය 
ගත්නේ 
නම්:
MRI 
ස්කෑනයෙන් 
ම 
අතුරු 
ආබාධ 
නොමැත ✅
ස්කෑනය 
චුම්බකයන් 
භාවිත 
කරයි — 
විකිරණ 
නොමැත.

ප්‍රතිවිරෝධ 
ඩයි 
打针 
ලබා 
ගත්නේ 
නම්:
මෘදු 
හිසරදය — 
සාමාන්‍යයි
ඔක්කාරය — 
සාමාන්‍යයෙන් 
ශීඝ්‍රයෙන් 
ගෙවේ
ඇලජික් 
ප්‍රතික්‍රිය — 
දුර්ලභ 
නමුත් 
සම 
කෝඡ 
හෝ 
හුස්ම 
ගැනීමේ 
අපහසුව 
ඇත්නම් 
කියන්න

සාමාන්‍ය 
යහපැවැත්ම:
😴 තෙහෙට්ටුව 
   දැනෙනවා නම් 
   — 
   හොඳින් 
   විවේකය 
   ගන්න
🧠 ප්‍රතිඵල 
   ගැන 
   කනස්සල්ල 
   දැනෙනවා නම් 
   — 
   සාමාන්‍යයි
   රැකවරණ 
   කණ්ඩායමට 
   කතා 
   කරන්න

පැහැදිලි 
ස්කෑනය 
ඇත්තටම 
සුභ 
ආරංචියකි.
ඔබේ 
රැකවරණ 
කණ්ඩායම 
ඕනෑම 
දිගු 
රෝග 
ලක්ෂණ 
සහ 
ඔබව 
සහය 
කරනු 
ඇත.`,
      `පෝෂණය
ගෙඩියක් 
නොමැතිව 
පවා 
සෞඛ්‍ය 
සම්පන්න 
ආහාරය 
ඔබේ 
මොළ 
සෞඛ්‍යය 
සහ 
සෙසු 
යහපැවැත්ම 
සහය 
කරයි.

✅ මොළ 
   සෞඛ්‍ය 
   ආහාර:
- තෙල් 
  සහිත 
  මාළු — 
  සැමන්, 
  ලේ 
  ළුඹුලු 
  (සතියකට 
  2 
  සේවා)
  ඔමේගා 3 
  මොළ 
  සෞඛ්‍ය 
  සඳහා
- කොළ 
  එළවළු — 
  නිවිති, 
  ගෝවා
- වර්ණවත් 
  පලතුරු 
  සහ 
  බෙරි — 
  ප්‍රතිජාරකය
- ගෙඩිවර්ග 
  සහ 
  ඇට — 
  walnuts 
  විශේෂයෙන් 
  හොඳයි
- ධාන්‍ය 
  — 
  ගොයම් 
  බත්, 
  ඕට්ස්
- දිනකට 
  වතුර 
  වීදුරු 
  8ක්

❌ සීමා 
   කරන්න:
- ඉතාම 
  සැකසූ 
  ආහාර
- අධික 
  සීනි
- මත්පැන් — 
  සැලකිය 
  යුතු 
  ලෙස 
  සීමා 
  කරන්න
- නිතරම 
  ඉදිරිපත් 
  කළ 
  ආහාර

💡 මොළ 
   සෞඛ්‍ය 
   ජීවන 
   රටා 
   උපදෙස්:
- නිත්‍ය 
  මෘදු 
  ව්‍යායාම — 
  දිනකට 
  මිනිත්තු 
  30ක් 
  ඇවිදීම
- හොඳ 
  නිද්‍රාව — 
  පැය 7-8
- ආතතිය 
  කළමනාකරණය — 
  භාවනාව, 
  යෝගා
- සමාජීය 
  ව සම්බන්ධ 
  ව සිටිම
- මනස 
  ක්‍රියාශීලීව 
  තබා 
  ගැනීම — 
  කියවීම, 
  ගොළු 
  ක්‍රීඩා`,
      `මොළ 
ස්කෑන් 
ප්‍රතිඵල 
බලා 
සිටීම 
ඉතා 
ආතතිජනක 
සහ 
කනස්සල්ල 
ගෙනෙයි.
ගෙඩියක් 
නොමැත 
ප්‍රතිඵලය 
ලැබීම 
මිශ්‍ර 
හැඟීම් 
ගෙනෙයි.

ඔබට 
දැනිය 
හැකිය:
- සහනය 
  සහ 
  ස්තූතිය
- නමුත් 
  තවමත් 
  කනස්සල්ල — 
  ඇයි 
  රෝග 
  ලක්ෂණ 
  තවමත් 
  ඇත්ද?
- රෝග 
  ලක්ෂණ 
  ඇති 
  කරන 
  දේ 
  ගැන 
  ව්‍යාකූලතාවය
- රෝග 
  ලක්ෂණ 
  දිගටම 
  ඇත්නම් 
  කලකිරීම
- සමහර 
  විට 
  රෝග 
  ලක්ෂණ 
  ගැන 
  අනෙකුත් 
  අය 
  විශ්වාස 
  නොකරන 
  දැනීමක්

මෙම 
හැඟීම් 
සියල්ල 
සම්පූර්ණයෙන්ම 
වලංගු 
සහ 
සාමාන්‍යයි.

💙 උදව් 
   වන දේ:
- සුභ 
  ආරංචිය 
  සමරන්න — 
  ගෙඩියක් 
  නොමැතිවීම 
  ඇත්තටම 
  පුදුම 
  ආරංචියකි
- ඔබේ 
  දිගු 
  රෝග 
  ලක්ෂණ 
  ගැන 
  ඔබේ 
  වෛද්‍යවරයා 
  සමඟ 
  විවෘතව 
  කතා 
  කරන්න — 
  ඔවුන් 
  ඔබව 
  විශ්වාස 
  කරයි
- රෝග 
  ලක්ෂණ 
  නිශ්ශබ්දව 
  දරා 
  නොගන්න — 
  දිගටම 
  වාර්තා 
  කරන්න
- ශාරීරික 
  සෞඛ්‍යයට 
  සමානව 
  ඔබේ 
  මානසික 
  සෞඛ්‍ය 
  ද 
  රැකගන්න

🗣️ ඔබේ 
   වෛද්‍යවරයාට 
   කියන්න:
- පැහැදිලි 
  ප්‍රතිඵලයෙන් 
  පසුව 
  ඉතා 
  කනස්සල්ලෙන් 
  දැනෙනවා නම්
- රෝග 
  ලක්ෂණ 
  ඔබේ 
  දෛනික 
  ජීවිතයට 
  සැලකිය 
  යුතු 
  ලෙස 
  බලපාන 
  නම්
- කලකිරී 
  සිටිනවා 
  නම් 
  හෝ 
  බලාපොරොත්තු 
  රහිත 
  දැනෙනවා නම්

ඔබේ 
රෝග 
ලක්ෂණ 
සැබෑ 
ය 
සහ 
නිසි 
විමර්ශනය 
සඳහා 
සුදුස්සෝ 
ය.
පැහැදිලි 
මොළ 
ස්කෑනය 
ඉතා 
සුභ 
ආරංචිය 
ය 
නමුත් 
ඔබේ 
රෝග 
ලක්ෂණ 
සැබෑ 
නොවේ 
හෝ 
වැදගත් 
නොවේ 
යන්න 
අදහස් 
නොකෙරේ.

ඔබේ 
රැකවරණ 
කණ්ඩායම 
ඔබව 
දිගටම 
සහය 
කිරීමට 
මෙහි 
සිටී.
ඔබ 
තනිව 
නොසිටී. 💙`
    ],
    ta: [
      `உங்கள் மூளை ஸ்கேன் உங்கள் 
மருத்துவரால் கவனமாக 
மதிப்பாய்வு செய்யப்பட்டுள்ளது.

நல்ல செய்தி — உங்கள் மூளை 
ஸ்கேனில் எந்த கட்டியும் 
காணப்படவில்லை.

இது மிகவும் ஆறுதல் அளிக்கும் 
முடிவு.
ஸ்கேன் உங்கள் மூளையில் 
எந்த அசாதாரண வளர்ச்சியையும் 
காட்டவில்லை என்று அர்த்தம்.

நீங்கள் அனுபவிக்கும் அறிகுறிகள் 
காரணமாக மருத்துவர் இந்த 
ஸ்கேனை ஆர்டர் செய்திருக்கலாம்.
கட்டி கண்டுபிடிக்கப்படவில்லை 
என்றாலும் உங்கள் அறிகுறிகள் 
உண்மையானவை மற்றும் 
மருத்துவர் தொடர்ந்து விசாரிக்கவும் 
ஆதரிக்கவும் இருப்பார்.

நீங்கள் நல்ல கைகளில் இருக்கிறீர்கள் 
மற்றும் உங்கள் பராமரிப்பு குழு 
உங்களுக்காக இங்கே இருக்கிறது.`,
      `கட்டி கண்டுபிடிக்கப்படவில்லை 
என்பதால் கட்டி சிகிச்சை 
தேவையில்லை.

இருப்பினும் உங்கள் மருத்துவர்:

👁️ தொடர்ந்து கண்காணிப்பார்
உங்கள் அறிகுறிகளை சரிபார்க்க 
தொடர்ச்சியான சந்திப்புகள்.
தேவைப்பட்டால் கூடுதல் சோதனைகள்.

💊 அறிகுறி மேலாண்மை
அறிகுறிகள் இருந்தால் மருத்துவர் 
காரணத்தை விசாரித்து பொருத்தமான 
சிகிச்சை தருவார்.
அறிகுறிகளை புறக்கணிக்காதீர்கள் — 
எப்போதும் தெரிவிக்கவும்.

🧠 கூடுதல் விசாரணை
அறிகுறிகள் தொடர்ந்தால் 
மருத்துவர் ஆர்டர் செய்யலாம்:
கூடுதல் MRI ஸ்கேன்கள்
மற்ற நரம்பியல் சோதனைகள்
இரத்த சோதனைகள்

🩺 வழக்கமான சோதனைகள்
கட்டி கண்டுபிடிக்கப்படவில்லை 
என்றாலும் உங்கள் மூளை 
ஆரோக்கியத்தை கண்காணிக்க 
வழக்கமான சோதனைகள் முக்கியம்.
உடல் நலமாக இருந்தாலும் 
அனைத்து பின்தொடர் சந்திப்புகளுக்கும் வாருங்கள்.`,
      `கட்டி நோய் கண்டறிதல் 
இல்லாமலும் இந்த அறிகுறிகளை 
கவனிக்கவும்:

🔴 இப்போதே மருத்துவமனைக்கு செல்லுங்கள்:
- வலிப்பு அல்லது உடல் நடுங்குதல்
- முன்பு இல்லாத திடீர் கடுமையான தலைவலி
- திடீரென்று பேச முடியாமல் போவது
- உடலின் ஒரு பக்கம் பலவீனமாவது
- நனவு இழப்பு
- திடீர் பார்வை மாற்றங்கள்

🟡 இன்றே மருத்துவரை அழையுங்கள்:
- படிப்படியாக மோசமாகும் தலைவலி
- புதிய நரம்பியல் அறிகுறிகள்
- பார்வை மாற்றங்கள்
- நினைவாற்றல் அல்லது சிந்தனை 
  பிரச்சனைகள் மோசமாவது
- முன்பு இல்லாத எந்த புதிய அறிகுறியும்

🟢 தொடர்ந்து கண்காணிக்கவும்:
- புதிய அல்லது மோசமாகும் 
  அறிகுறிகளை குறித்துக்கொள்ளுங்கள்
- அறிகுறி டைரி வைத்திருங்கள்
- அனைத்து பின்தொடர் சந்திப்புகளுக்கும் வாருங்கள்
- ஒவ்வொரு சந்திப்பிலும் மாற்றங்களை தெரிவிக்கவும்`,
      `நல்ல கேள்விகள்:

- கட்டி இல்லாவிட்டால் 
  ஏன் அறிகுறிகள் இருந்தன?
- கூடுதல் சோதனைகள் தேவையா?
- என் அடுத்த பின்தொடர் சந்திப்பு எப்போது?
- மற்றொரு MRI ஸ்கேன் தேவையா?
- எதிர்காலத்தில் என்ன அறிகுறிகள் 
  என்னை கவலைப்படுத்த வேண்டும்?
- என் அறிகுறிகளை விளக்கக்கூடிய 
  வேறு ஏதாவது இருக்கிறதா?
- நரம்பியல் நிபுணரை பார்க்க வேண்டுமா?
- வாகனம் ஓட்டலாமா, வேலை செய்யலாமா?
- மூளை ஆரோக்கியத்திற்கு என்ன 
  வாழ்க்கை முறை மாற்றங்கள் உதவும்?`,
      `கட்டி கண்டுபிடிக்கப்படவில்லை 
மற்றும் கட்டி சிகிச்சை 
தரப்படவில்லை என்பதால் 
சிகிச்சை பக்க விளைவுகள் 
பற்றி கவலைப்படத் தேவையில்லை.

MRI ஸ்கேன் எடுத்தால்:
MRI ஸ்கேனிலிருந்து பக்க விளைவுகள் இல்லை ✅
ஸ்கேன் காந்தங்களை பயன்படுத்துகிறது — 
கதிர்வீச்சு இல்லை.

கான்ட்ராஸ்ட் டை ஊசி போட்டால்:
மிதமான தலைவலி — இயல்பானது
குமட்டல் — பொதுவாக விரைவில் கடந்துவிடும்
ஒவ்வாமை எதிர்வினை — அரிதானது 
ஆனால் தோல் தடிப்பு அல்லது 
சுவாசிக்கும் சிரமம் ஏற்பட்டால் 
மருத்துவரிடம் சொல்லுங்கள்

பொதுவான நலம்:
😴 சோர்வாக உணர்ந்தால் — நன்றாக ஓய்வெடுங்கள்
🧠 முடிவுகளைப் பற்றி கவலையாக உணர்ந்தால் — 
   இது இயல்பானது
   பராமரிப்பு குழுவிடம் பேசுங்கள்

தெளிவான ஸ்கேன் உண்மையிலேயே 
நல்ல செய்தி.
உங்கள் பராமரிப்பு குழு 
தொடர்ந்து உங்களை ஆதரிக்கும்.`,
      `கட்டி இல்லாமலும் ஆரோக்கியமான 
உணவு உங்கள் மூளை ஆரோக்கியத்தையும் 
ஒட்டுமொத்த நலனையும் ஆதரிக்கிறது.

✅ மூளைக்கு ஆரோக்கியமான உணவுகள்:
- எண்ணெய் மீன் — சால்மன் 
  மத்தி (வாரத்தில் 2 முறை)
  மூளை ஆரோக்கியத்திற்கு ஒமேகா 3
- இலை பச்சை காய்கறிகள் — 
  கீரை முட்டைக்கோஸ்
- வண்ணமயமான பழங்கள் மற்றும் பெர்ரி — 
  ஆக்ஸிஜனேற்றிகள்
- கொட்டைகள் மற்றும் விதைகள் — 
  வால்நட் குறிப்பாக நல்லது
- முழு தானியங்கள் — 
  பழுப்பு அரிசி ஓட்ஸ்
- தினமும் 8 கிளாஸ் தண்ணீர்

❌ இவற்றை குறைக்கவும்:
- மிகவும் பதப்படுத்தப்பட்ட உணவு
- அதிக சர்க்கரை
- மது — குறிப்பிடத்தக்க அளவில் குறைக்கவும்
- அதிக உப்பு
- தொடர்ந்து வறுத்த மற்றும் 
  எண்ணெய் உணவு

💡 மூளை ஆரோக்கிய வாழ்க்கை முறை குறிப்புகள்:
- வழக்கமான மென்மையான உடற்பயிற்சி — 
  தினமும் 30 நிமிடம் நடைபயிற்சி
- நல்ல தூக்கம் — 7 முதல் 8 மணி நேரம்
- மன அழுத்தத்தை நிர்வகிக்கவும் — 
  தியானம் யோகா சுவாசம்
- சமூக தொடர்பில் இருங்கள்
- மனதை சுறுசுறுப்பாக வைத்திருங்கள் — 
  படித்தல் புதிர்கள் கற்றல்`,
      `மூளை ஸ்கேன் முடிவுகளுக்காக 
காத்திருப்பது மிகவும் மன அழுத்தமும் 
கவலையும் தரும்.
கட்டி இல்லை என்ற முடிவு 
பெறுவது பல கலந்த உணர்வுகளை 
கொண்டு வரலாம்.

உணரலாம்:
- நிம்மதி மற்றும் நன்றி
- ஆனால் இன்னும் கவலை — 
  ஏன் இன்னும் அறிகுறிகள் இருக்கின்றன?
- அறிகுறிகளை ஏற்படுத்துவது என்ன 
  என்பதில் குழப்பம்
- அறிகுறிகள் தொடர்ந்தால் விரக்தி
- சில நேரங்களில் அறிகுறிகள் பற்றி 
  மற்றவர்கள் நம்பவில்லை என்ற உணர்வு

இந்த உணர்வுகள் அனைத்தும் 
முற்றிலும் சரியானவை மற்றும் இயல்பானவை.

💙 உதவக்கூடியவை:
- நல்ல செய்தியை கொண்டாடுங்கள் — 
  கட்டி இல்லாதது உண்மையிலேயே 
  அற்புதமான செய்தி
- தொடர்ந்த அறிகுறிகளைப் பற்றி 
  மருத்துவரிடம் திறந்து பேசுங்கள் — 
  அவர்கள் உங்களை நம்புகிறார்கள்
- அறிகுறிகளை மௌனமாக 
  சகித்துக்கொள்ளாதீர்கள் — 
  தொடர்ந்து தெரிவிக்கவும்
- உடல் ஆரோக்கியத்தைப் போலவே 
  மன ஆரோக்கியத்தையும் கவனியுங்கள்
- தேவைப்படும்போது ஓய்வெடுங்கள்
- மகிழ்ச்சி மற்றும் அமைதி தரும் 
  செயல்களை செய்யுங்கள்

🗣️ மருத்துவரிடம் சொல்லுங்கள்:
- தெளிவான முடிவுக்கு பிறகும் 
  மிகவும் கவலையாக உணர்ந்தால்
- அறிகுறிகள் உங்கள் அன்றாட 
  வாழ்க்கையை குறிப்பிடத்தக்க 
  அளவில் பாதிக்கிறது என்றால்
- மனச்சோர்வாக அல்லது 
  நம்பிக்கையற்றதாக உணர்ந்தால்
- கவலையால் தூக்கம் வராவிட்டால்
- தெளிவான ஸ்கேன் இருந்தும் 
  வாழ்க்கை தரம் மோசமாக இருப்பதாக 
  உணர்ந்தால்

உங்கள் அறிகுறிகள் உண்மையானவை 
மற்றும் சரியான விசாரணைக்கு 
தகுதியானவை.
தெளிவான மூளை ஸ்கேன் மிகவும் 
நல்ல செய்தி ஆனால் உங்கள் 
அறிகுறிகள் உண்மையில்லை அல்லது 
முக்கியமில்லை என்று அர்த்தமில்லை.

உங்கள் பராமரிப்பு குழு 
உங்களை தொடர்ந்து ஆதரிக்க 
இங்கே இருக்கிறது.
நீங்கள் தனியாக இல்லை. 💙`
    ]
  },
};

export function getProfileKey(tumourType) {
  const t = (tumourType || '').toLowerCase();
  if (t.includes('no tumor') || t.includes('no tumour') || t.includes('normal') || t === 'no_tumor') return 'no_tumor';
  if (t.includes('glioma') || t.includes('glioblastoma') || t.includes('gbm')) {
    if (t.includes('grade 4') || t.includes('grade iv') || t.includes('glioblastoma') || t.includes('gbm')) return 'glioma_4';
    if (t.includes('grade 3') || t.includes('grade iii') || t.includes('grade_3') || t.includes('_3')) return 'glioma_3';
    if (t.includes('grade 2') || t.includes('grade ii') || t.includes('grade_2') || t.includes('_2')) return 'glioma_2';
    return 'glioma_1';
  }
  if (t.includes('meningioma')) {
    if (t.includes('grade 3') || t.includes('grade iii') || t.includes('anaplastic')) return 'meningioma_3';
    if (t.includes('grade 2') || t.includes('grade ii') || t.includes('atypical')) return 'meningioma_2';
    return 'meningioma_1';
  }
  if (t.includes('pituitary') || t.includes('adenoma')) {
    if (t.includes('grade 2') || t.includes('macroadenoma') || t.includes('invasive') || t.includes('grade_2') || t.includes('_2')) return 'pituitary_2';
    return 'pituitary_1';
  }
  return 'no_tumor';
}
