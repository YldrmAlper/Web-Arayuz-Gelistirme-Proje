$(document).ready(function() {
    // DOM Elementleri
    const passwordInput = $('#password');
    const togglePasswordBtn = $('.toggle-password');
    const strengthMeter = $('#strength-meter');
    const strengthText = $('#strength-text');
    const lengthCheck = $('#length-check');
    const lowercaseCheck = $('#lowercase-check');
    const uppercaseCheck = $('#uppercase-check');
    const numberCheck = $('#number-check');
    const specialCheck = $('#special-check');
    const testBtn = $('#test-btn');
    const resultContainer = $('#result-container');
    const resultMessage = $('#result-message');
    const timeTocrack = $('#time-to-crack');
    const retryBtn = $('#retry-btn');
    const themeToggleBtn = $('#theme-toggle');
    
    // Regex Desenleri
    const lowercaseRegex = /[a-z]/;
    const uppercaseRegex = /[A-Z]/;
    const numberRegex = /[0-9]/;
    const specialRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    
    // Tema işlemleri
    initTheme();
    
    // Tema değiştirme butonu
    themeToggleBtn.on('click', function() {
        toggleTheme();
    });
    
    // Tema değiştirme fonksiyonu
    function toggleTheme() {
        if ($('body').hasClass('dark-theme')) {
            // Karanlık temadan aydınlık temaya geçiş
            $('body').removeClass('dark-theme').addClass('light-theme');
            themeToggleBtn.html('<i class="bi bi-moon"></i>');
            localStorage.setItem('theme', 'light');
            
            // Input değerleri mevcut ise rengini ayarla
            if (passwordInput.val()) {
                passwordInput.css('color', ''); // Varsayılan rengi kullan
            }
        } else {
            // Aydınlık temadan karanlık temaya geçiş
            $('body').removeClass('light-theme').addClass('dark-theme');
            themeToggleBtn.html('<i class="bi bi-sun"></i>');
            localStorage.setItem('theme', 'dark');
            
            // Input değerleri mevcut ise rengini ayarla
            if (passwordInput.val()) {
                passwordInput.css('color', '#e2e8f0'); // Açık renk kullan
            }
        }
    }
    
    // Sayfa yüklendiğinde tema ayarını kontrol et
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme === 'dark') {
            $('body').addClass('dark-theme');
            themeToggleBtn.html('<i class="bi bi-sun"></i>');
            
            // Input değerleri mevcut ise rengini ayarla
            if (passwordInput.val()) {
                passwordInput.css('color', '#e2e8f0');
            }
        } else if (savedTheme === 'light') {
            $('body').addClass('light-theme');
            themeToggleBtn.html('<i class="bi bi-moon"></i>');
        } else {
            // Sistem tercihini kontrol et ve uygun simgeyi ayarla
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                themeToggleBtn.html('<i class="bi bi-sun"></i>');
                
                // Input değerleri mevcut ise rengini ayarla
                if (passwordInput.val()) {
                    passwordInput.css('color', '#e2e8f0');
                }
            } else {
                themeToggleBtn.html('<i class="bi bi-moon"></i>');
            }
        }
    }
    
    // Parolayı Göster/Gizle fonksiyonu
    togglePasswordBtn.on('click', function() {
        const type = passwordInput.attr('type') === 'password' ? 'text' : 'password';
        passwordInput.attr('type', type);
        
        // İkonu değiştir
        if (type === 'password') {
            $(this).find('i').removeClass('bi-eye-slash').addClass('bi-eye');
        } else {
            $(this).find('i').removeClass('bi-eye').addClass('bi-eye-slash');
        }
    });
    
    // Parola girişi dinleyicisi
    passwordInput.on('input', function() {
        const password = $(this).val();
        updatePasswordStrength(password);
        
        // Tema kontrolü ve renk güncelleme
        if (password && $('body').hasClass('dark-theme')) {
            $(this).css('color', '#e2e8f0');
        } else if (!password || !$('body').hasClass('dark-theme')) {
            $(this).css('color', '');
        }
    });
    
    // Test Butonuna tıklama
    testBtn.on('click', function() {
        const password = passwordInput.val();
        if (password.length > 0) {
            showResult(password);
        } else {
            alert('Lütfen bir parola girin!');
        }
    });
    
    // Yeniden Dene butonuna tıklama
    retryBtn.on('click', function() {
        resultContainer.addClass('d-none');
        passwordInput.val('').focus();
        updatePasswordStrength('');
    });

    // Parola gücünü hesaplayan fonksiyon
    function calculatePasswordStrength(password) {
        if (!password) return 0;
        
        let score = 0;
        
        // Uzunluk puanı (maksimum 40 puan)
        const lengthScore = Math.min(password.length * 4, 40);
        score += lengthScore;
        
        // Karakter çeşitliliği için puan
        const hasLowercase = lowercaseRegex.test(password);
        const hasUppercase = uppercaseRegex.test(password);
        const hasNumber = numberRegex.test(password);
        const hasSpecial = specialRegex.test(password);
        
        const charTypeCount = [hasLowercase, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
        
        // Her karakter tipi için 10 puan (maksimum 40 puan)
        score += charTypeCount * 10;
        
        // Karakter çeşitliliği bonus puanı (2'den fazla tür için bonus)
        if (charTypeCount > 2) {
            score += 10;
        }
        
        // Orta kısmında sayı veya özel karakter varsa bonus puan
        const middleChars = password.substring(1, password.length - 1);
        if (numberRegex.test(middleChars) || specialRegex.test(middleChars)) {
            score += 10;
        }
        
        // Gereksinimler karşılanmazsa ceza puanları
        if (!hasLowercase) score -= 10;
        if (!hasUppercase) score -= 10;
        if (!hasNumber) score -= 10;
        if (!hasSpecial) score -= 10;
        
        // Sadece sayılardan veya sadece harflerden oluşuyorsa ceza puanı
        if (/^\d+$/.test(password) || /^[a-zA-Z]+$/.test(password)) {
            score -= 20;
        }
        
        // 100 üzerinden değerlendirme
        return Math.max(0, Math.min(100, score));
    }
    
    // Parola gücünü güncelleme
    function updatePasswordStrength(password) {
        // Gereksinimleri kontrol et
        updateRequirementChecks(password);
        
        // Parola gücünü hesapla
        const strength = calculatePasswordStrength(password);
        
        // İlerleme çubuğunu güncelle
        strengthMeter.css('width', strength + '%');
        strengthMeter.attr('aria-valuenow', strength);
        
        // Renkleri güncelle
        strengthMeter.removeClass('strength-weak strength-medium strength-strong');
        
        let strengthLabel = '';
        if (strength < 40) {
            strengthMeter.addClass('strength-weak');
            strengthLabel = 'Zayıf';
        } else if (strength < 70) {
            strengthMeter.addClass('strength-medium');
            strengthLabel = 'Orta';
        } else {
            strengthMeter.addClass('strength-strong');
            strengthLabel = 'Güçlü';
        }
        
        // Metin bilgisini güncelle
        if (password.length === 0) {
            strengthText.text('Parola güçlülüğü: Değerlendirilmedi');
        } else {
            strengthText.text(`Parola güçlülüğü: ${strengthLabel} (${strength}/100)`);
        }
        
        // Animasyon efekti
        strengthMeter.addClass('animate-pulse');
        setTimeout(() => {
            strengthMeter.removeClass('animate-pulse');
        }, 600);
    }
    
    // Gereksinim kontrollerini güncelle
    function updateRequirementChecks(password) {
        // En az 8 karakter
        updateRequirement(lengthCheck, password.length >= 8);
        
        // En az 1 küçük harf
        updateRequirement(lowercaseCheck, lowercaseRegex.test(password));
        
        // En az 1 büyük harf
        updateRequirement(uppercaseCheck, uppercaseRegex.test(password));
        
        // En az 1 sayı
        updateRequirement(numberCheck, numberRegex.test(password));
        
        // En az 1 özel karakter
        updateRequirement(specialCheck, specialRegex.test(password));
    }
    
    // Gereksinim durumunu güncelle
    function updateRequirement(element, isValid) {
        if (isValid) {
            element.addClass('valid');
            element.find('i').removeClass('bi-x-circle text-danger').addClass('bi-check-circle text-success');
        } else {
            element.removeClass('valid');
            element.find('i').removeClass('bi-check-circle text-success').addClass('bi-x-circle text-danger');
        }
    }
    
    // Sonuçları göster
    function showResult(password) {
        const strength = calculatePasswordStrength(password);
        let message = '';
        let timeToCrack = '';
        let alertClass = '';
        
        // Parola kırılma süresini tahmin et (çok basit bir tahmin)
        if (strength < 40) {
            message = 'Bu parola <strong>zayıf</strong> ve kolayca kırılabilir.';
            timeToCrack = 'Kırılma süresi tahmini: <strong>Birkaç saniye - Birkaç saat</strong>';
            alertClass = 'alert-danger';
        } else if (strength < 70) {
            message = 'Bu parola <strong>orta seviyede</strong> güvenlidir.';
            timeToCrack = 'Kırılma süresi tahmini: <strong>Birkaç ay - Birkaç yıl</strong>';
            alertClass = 'alert-warning';
        } else {
            message = 'Bu parola <strong>güçlü</strong> ve kırılması oldukça zordur.';
            timeToCrack = 'Kırılma süresi tahmini: <strong>Onlarca yıl - Yüzyıllar</strong>';
            alertClass = 'alert-success';
        }
        
        // Mesajı güncelle
        resultMessage.html(message);
        timeTocrack.html(timeToCrack);
        
        // Uyarı rengini ayarla
        resultContainer.find('.alert')
            .removeClass('alert-danger alert-warning alert-success')
            .addClass(alertClass);
        
        // Sonucu göster
        resultContainer.removeClass('d-none');
        $('html, body').animate({
            scrollTop: resultContainer.offset().top - 50
        }, 500);
    }
    
    // Parola kopyalanmasını engelle
    passwordInput.on('copy', function(e) {
        e.preventDefault();
        alert('Güvenlik nedeniyle parolanızı kopyalamanız engellendi.');
    });
    
    // Doğrudan ekle/yapıştır olayını engelle
    passwordInput.on('cut paste drop', function(e) {
        e.preventDefault();
        alert('Güvenlik nedeniyle bu işlem engellendi. Parolanızı manuel olarak girin.');
    });
    
    // İlk yükleme sırasında parola alanını odakla
    passwordInput.focus();
    
    // Klavye kısayolları
    $(document).on('keydown', function(e) {
        // Enter tuşuna basıldığında ve form alanı odaktaysa test butonuna tıkla
        if (e.keyCode === 13 && passwordInput.is(':focus')) {
            testBtn.click();
        }
        // Escape tuşuna basıldığında ve sonuç gösteriliyorsa temizle
        if (e.keyCode === 27 && !resultContainer.hasClass('d-none')) {
            retryBtn.click();
        }
    });
}); 