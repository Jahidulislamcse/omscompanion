<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'OMS COMPANION') }} - oms clinical hub &amp; patient management platform</title>
        <meta name="description" content="OMS COMPANION empowers BDS Doctors with surgical video archives, online consultations, transparent management tracking, and professional Learning.">
        
        <!-- Google Search & OpenGraph Meta Tags -->
        <meta property="og:title" content="OMS COMPANION - oms clinical hub &amp; patient management platform">
        <meta property="og:description" content="OMS COMPANION empowers BDS Doctors with surgical video archives, online consultations, transparent management tracking, and professional Learning.">
        <meta property="og:site_name" content="omscompanion.com">
        <meta property="og:type" content="website">

        <!-- Schema.org JSON-LD Structured Data for Google Search -->
        <script type="application/ld+json">
        {
          "@@context": "https://schema.org",
          "@@type": "WebSite",
          "name": "omscompanion.com",
          "alternateName": "oms clinical hub & patient management platform",
          "url": "https://www.omscompanion.com/",
          "description": "OMS COMPANION empowers BDS Doctors with surgical video archives, online consultations, transparent management tracking, and professional Learning."
        }
        </script>

        <!-- Dynamic Favicon using Site Logo -->
        <link rel="icon" type="image/png" href="{{ route('site.logo.stream') }}">
        <link rel="shortcut icon" href="{{ route('site.logo.stream') }}">
        <link rel="apple-touch-icon" href="{{ route('site.logo.stream') }}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', 'resources/css/app.css'])
        @inertiaHead
    </head>
    <body>
        @inertia
    </body>
</html>
