#!/usr/bin/env python3
import os
import sys
import json
import itertools
import zipfile
from pathlib import Path
from typing import List, Dict, Tuple
import openai
from jinja2 import Template
from slugify import slugify
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Set OpenAI API key
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set")
openai.api_key = api_key

# HTML template
HTML_TEMPLATE = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }}</title>
    <meta name="description" content="{{ meta_description }}">
    <link rel="stylesheet" href="styles.css">
    <style>
        /* Navigation Styles */
        .navbar {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
            position: sticky;
            top: 0;
            z-index: 1000;
            border-bottom: 1px solid var(--border-color);
        }

        .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo-section {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .logo-3d {
            width: 60px;
            height: 60px;
            background: 
                linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(16, 185, 129, 0.9) 100%),
                radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 60%),
                linear-gradient(225deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 
                0 12px 40px rgba(59, 130, 246, 0.5),
                0 6px 20px rgba(16, 185, 129, 0.3),
                inset 0 2px 12px rgba(255, 255, 255, 0.4),
                inset 0 -2px 12px rgba(0, 0, 0, 0.15);
            transform: perspective(1000px) rotateX(20deg) rotateY(-20deg) translateZ(10px);
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .logo-3d::after {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: conic-gradient(
                from 0deg,
                transparent 0deg,
                rgba(255, 255, 255, 0.15) 45deg,
                rgba(59, 130, 246, 0.2) 90deg,
                rgba(16, 185, 129, 0.2) 135deg,
                transparent 180deg,
                rgba(255, 255, 255, 0.1) 225deg,
                rgba(59, 130, 246, 0.15) 270deg,
                rgba(16, 185, 129, 0.15) 315deg,
                transparent 360deg
            );
            animation: rotate-3d 6s linear infinite;
            border-radius: 50%;
            z-index: 1;
        }

        @keyframes rotate-3d {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .logo-3d:hover {
            transform: perspective(1000px) rotateX(-10deg) rotateY(10deg) scale(1.15) translateZ(25px);
            box-shadow: 
                0 20px 60px rgba(59, 130, 246, 0.6),
                0 10px 30px rgba(16, 185, 129, 0.4),
                inset 0 4px 16px rgba(255, 255, 255, 0.5),
                inset 0 -4px 16px rgba(0, 0, 0, 0.2);
        }

        .logo-3d:hover::after {
            animation-duration: 2s;
        }

        .logo-3d::before {
            content: '';
            position: absolute;
            top: 0;
            left: -120%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                90deg, 
                transparent, 
                rgba(255, 255, 255, 0.6) 30%, 
                rgba(255, 255, 255, 0.8) 50%, 
                rgba(255, 255, 255, 0.6) 70%, 
                transparent
            );
            transition: left 0.8s ease-out;
            z-index: 2;
            border-radius: 16px;
        }

        .logo-3d:hover::before {
            left: 120%;
        }

        .logo-img {
            width: 38px;
            height: 38px;
            object-fit: contain;
            filter: brightness(0) invert(1) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
            z-index: 3;
            position: relative;
            transition: all 0.3s ease;
        }

        .logo-3d:hover .logo-img {
            filter: brightness(0) invert(1) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
            transform: scale(1.05);
        }

        .logo-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary-color);
            text-decoration: none;
        }

        .logo-text:hover {
            text-decoration: none;
            color: var(--secondary-color);
        }

        .nav-buttons {
            display: flex;
            gap: 1rem;
            align-items: center;
        }

        .nav-btn {
            padding: 0.75rem 1.5rem;
            border-radius: 25px;
            text-decoration: none;
            font-weight: 600;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .nav-btn-primary {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .nav-btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
            text-decoration: none;
            color: white;
        }

        .nav-btn-secondary {
            background: white;
            color: var(--primary-color);
            border: 2px solid var(--primary-color);
        }

        .nav-btn-secondary:hover {
            background: var(--primary-color);
            color: white;
            text-decoration: none;
        }

        @media (max-width: 768px) {
            .nav-container {
                padding: 1rem;
                flex-direction: column;
                gap: 1rem;
            }

            .nav-buttons {
                gap: 0.5rem;
            }

            .nav-btn {
                padding: 0.5rem 1rem;
                font-size: 0.8rem;
            }

            .logo-text {
                font-size: 1.25rem;
            }

            .logo-3d {
                width: 50px;
                height: 50px;
            }

            .logo-img {
                width: 28px;
                height: 28px;
            }
        }

        .winner-badge {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.875rem;
            font-weight: 500;
            margin-left: 1rem;
            background-color: #10b981;
            color: white;
        }
        
        .comparison-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding: 1rem;
            background-color: #f8fafc;
            border-radius: 8px;
        }
        
        .comparison-item {
            flex: 1;
            text-align: center;
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--primary-color);
        }
        
        .vs-badge {
            padding: 0.5rem 1rem;
            background-color: var(--secondary-color);
            color: white;
            border-radius: 4px;
            margin: 0 1rem;
        }
        
        .navigation-section {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid var(--border-color);
        }
        
        .navigation-title {
            text-align: center;
            margin-bottom: 1.5rem;
            color: var(--text-color);
            font-size: 1.25rem;
        }
        
        .navigation-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1rem;
            justify-items: center;
        }

        .nav-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem 1.5rem;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            color: var(--primary-color);
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.95rem;
            border: 2px solid var(--border-color);
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            min-width: 220px;
            justify-content: center;
        }

        .nav-link:hover {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            text-decoration: none;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
            border-color: transparent;
        }

        .nav-link::before {
            content: '⚡';
            font-size: 1.1rem;
        }
        
        .comparison-table {
            width: 100%;
            border-collapse: collapse;
            margin: 2rem 0;
        }
        
        .comparison-row {
            display: grid;
            grid-template-columns: 1fr 2fr 2fr;
            gap: 1rem;
            padding: 1rem;
            border-bottom: 1px solid var(--border-color);
        }
        
        .aspect {
            font-weight: 600;
            color: var(--text-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .item1-details, .item2-details {
            position: relative;
            padding-right: 4rem;
        }
        
        .item-content {
            color: var(--text-color);
        }
        
        .winner-badge {
            position: absolute;
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.875rem;
            font-weight: 500;
            background-color: #10b981;
            color: white;
        }

        /* Footer Styles */
        .footer {
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            color: white;
            margin-top: 4rem;
            padding: 3rem 0 2rem 0;
        }

        .footer-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .footer-links {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .footer-link {
            color: #d1d5db;
            text-decoration: none;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            transition: all 0.3s ease;
            text-align: center;
            border: 1px solid #374151;
        }

        .footer-link:hover {
            color: white;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            text-decoration: none;
            transform: translateY(-2px);
            border-color: transparent;
        }

        .footer-copyright {
            text-align: center;
            padding-top: 2rem;
            border-top: 1px solid #374151;
            color: #9ca3af;
            font-size: 0.9rem;
        }

        @media (max-width: 768px) {
            .comparison-row {
                grid-template-columns: 1fr;
                gap: 0.5rem;
            }
            
            .item1-details, .item2-details {
                padding-right: 0;
                padding-bottom: 2rem;
            }
            
            .winner-badge {
                top: auto;
                bottom: 0;
                right: 0;
                transform: none;
            }

            .navigation-grid {
                grid-template-columns: 1fr;
                gap: 0.75rem;
            }

            .nav-link {
                min-width: auto;
            }

            .footer-links {
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
            }
        }
        
        @media (max-width: 640px) {
            .comparison-header {
                flex-direction: column;
                gap: 1rem;
            }
            
            .vs-badge {
                margin: 0.5rem 0;
            }

            .footer-links {
                grid-template-columns: 1fr;
            }
        }

        .method-labels {
            display: grid;
            grid-template-columns: 1fr 2fr 2fr;
            gap: 1rem;
            margin-bottom: 1rem;
            padding: 0.5rem 1rem;
            background-color: #f8fafc;
            border-radius: 8px;
        }

        .method-label {
            font-weight: 600;
            color: var(--primary-color);
            text-align: left;
            padding-left: 1rem;
        }

        .progress-container {
            width: 100%;
            height: 4px;
            background-color: #e2e8f0;
            border-radius: 2px;
            margin-top: 0.5rem;
            overflow: hidden;
        }

        .progress-bar {
            height: 100%;
            background-color: var(--primary-color);
            border-radius: 2px;
            transition: width 0.3s ease;
        }

        .results-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 2rem;
            padding: 1rem;
            background-color: #f8fafc;
            border-radius: 8px;
        }

        .final-score {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--text-color);
        }

        .winner-declaration {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--primary-color);
            padding: 0.5rem 1rem;
            background-color: #10b981;
            color: white;
            border-radius: 4px;
        }

        @media (max-width: 768px) {
            .method-labels {
                grid-template-columns: 1fr;
                gap: 0.5rem;
            }

            .spacer {
                display: none;
            }

            .method-label {
                text-align: center;
                padding-left: 0;
            }

            .results-section {
                flex-direction: column;
                gap: 1rem;
                text-align: center;
            }
        }

        .winner-column {
            background-color: rgba(16, 185, 129, 0.05);
            border: 3px solid var(--winner-color) !important;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
            position: relative;
        }

        .winner-indicator {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            margin-top: 0.75rem;
            padding: 0.25rem 0.5rem;
            background-color: var(--winner-color);
            color: white;
            border-radius: 12px;
            font-size: 0.75rem;
            width: fit-content;
            animation: bounce 0.5s ease-in-out;
        }

        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
            }
            40% {
                transform: translateY(-5px);
            }
            60% {
                transform: translateY(-3px);
            }
        }

        .winner-emoji {
            font-size: 1rem;
        }

        .winner-text {
            font-weight: 600;
            font-size: 0.75rem;
        }

        .container-full-width {
            width: 100%;
            max-width: none;
        }

        .winner-section {
            width: 100vw;
            margin-left: calc(-50vw + 50%);
            padding: 2rem;
            background-color: var(--header-bg);
            display: flex;
            justify-content: center;
        }

        .winner-card {
            background-color: white;
            border-radius: 8px;
            padding: 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 800px;
            width: 100%;
            text-align: center;
        }

        .winner-reason {
            font-size: 1rem;
            color: var(--text-color);
            line-height: 1.6;
            text-align: center;
            max-width: 600px;
            margin: 0 auto;
        }

        .content-4-section {
            margin: 3rem 0;
            padding: 2rem;
            background-color: var(--header-bg);
            border-radius: 8px;
            border: 1px solid var(--border-color);
        }

        .content-4-text {
            text-align: center;
            color: var(--text-color);
            font-size: 1.1rem;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto 2rem auto;
        }

        .cta-button-container {
            display: flex;
            justify-content: center;
            margin-top: 2rem;
        }

        .cta-button {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem 2rem;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 1.1rem;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
            text-decoration: none;
            color: white;
        }

        .cta-button:before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }

        .cta-button:hover:before {
            left: 100%;
        }

        .button-icon {
            font-size: 1.25rem;
            animation: pulse 2s infinite;
        }

        .button-text {
            font-weight: 600;
        }

        .button-arrow {
            font-size: 1.25rem;
            transition: transform 0.3s ease;
        }

        .cta-button:hover .button-arrow {
            transform: translateX(3px);
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }

        .content-5-section {
            margin: 3rem 0;
            padding: 2rem;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 12px;
            border: 1px solid var(--border-color);
        }

        .comparison-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }

        .comparison-card {
            background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 16px;
            padding: 0;
            border: 1px solid var(--border-color);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            transition: all 0.4s ease;
            overflow: hidden;
            position: relative;
            min-height: 280px;
            display: flex;
            flex-direction: column;
        }

        .comparison-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 12px 40px rgba(59, 130, 246, 0.15);
        }

        .comparison-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
        }

        .card-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 2rem 2rem 1rem 2rem;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
        }

        .category-icon {
            font-size: 2rem;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .comparison-card h4 {
            color: var(--primary-color);
            margin: 0;
            font-size: 1.2rem;
            font-weight: 700;
            line-height: 1.3;
        }

        .comparison-text {
            color: var(--text-color);
            line-height: 1.6;
            padding: 0 2rem;
            font-size: 1rem;
            flex-grow: 1;
            display: flex;
            align-items: center;
        }

        .category-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 1rem 2rem;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            text-decoration: none;
            border-radius: 0 0 16px 16px;
            font-weight: 600;
            font-size: 0.95rem;
            transition: all 0.3s ease;
            margin-top: auto;
        }

        .category-button:hover {
            background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
            transform: translateY(-2px);
            text-decoration: none;
            color: white;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .category-button .button-arrow {
            transition: transform 0.3s ease;
            font-size: 1.1rem;
        }

        .category-button:hover .button-arrow {
            transform: translateX(4px);
        }

        @media (max-width: 768px) {
            .comparison-cards {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }

            .comparison-card {
                min-height: 240px;
            }

            .card-header {
                padding: 1.5rem 1.5rem 0.75rem 1.5rem;
            }

            .comparison-text {
                padding: 0 1.5rem;
                font-size: 0.9rem;
            }

            .category-button {
                padding: 0.875rem 1.5rem;
                font-size: 0.9rem;
            }
        }

        .content-6-section {
            margin: 3rem 0;
            padding: 3rem 2rem;
            background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
            border-radius: 16px;
            position: relative;
            overflow: hidden;
        }

        .content-6-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="80" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="70" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="30" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }

        .content-6-container {
            position: relative;
            z-index: 2;
            text-align: center;
        }

        .content-6-text {
            color: white;
            font-size: 1.2rem;
            line-height: 1.7;
            margin-bottom: 2.5rem;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .zeyvior-cta-container {
            display: flex;
            justify-content: center;
        }

        .zeyvior-button {
            position: relative;
            display: inline-block;
            padding: 1.5rem 3rem;
            background: linear-gradient(135deg, #ff6b6b, #ee5a24, #ff9ff3, #54a0ff);
            background-size: 300% 300%;
            border-radius: 50px;
            text-decoration: none;
            color: white;
            font-weight: 700;
            font-size: 1.3rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            transition: all 0.4s ease;
            overflow: hidden;
            animation: gradient-shift 3s ease infinite;
        }

        @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        .zeyvior-button:hover {
            transform: translateY(-5px) scale(1.05);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
            text-decoration: none;
            color: white;
        }

        .button-bg-animation {
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            transition: left 0.6s;
        }

        .zeyvior-button:hover .button-bg-animation {
            left: 100%;
        }

        .button-content {
            position: relative;
            z-index: 2;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .zeyvior-icon {
            font-size: 1.5rem;
            animation: robot-bounce 2s ease-in-out infinite;
        }

        .zeyvior-text {
            font-weight: 700;
            letter-spacing: 0.5px;
        }

        .zeyvior-sparkle {
            font-size: 1.25rem;
            animation: sparkle-twinkle 1.5s ease-in-out infinite alternate;
        }

        @keyframes robot-bounce {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-3px) rotate(5deg); }
        }

        @keyframes sparkle-twinkle {
            0% { transform: scale(1) rotate(0deg); opacity: 0.8; }
            100% { transform: scale(1.2) rotate(180deg); opacity: 1; }
        }

        @media (max-width: 768px) {
            .content-6-section {
                padding: 2rem 1rem;
            }

            .content-6-text {
                font-size: 1rem;
                margin-bottom: 2rem;
            }

            .zeyvior-button {
                padding: 1.25rem 2.5rem;
                font-size: 1.1rem;
            }
        }
    </style>
</head>
<body>
    <!-- Navigation Bar -->
    <nav class="navbar">
        <div class="nav-container">
            <div class="logo-section">
                <a href="https://zeyvior.com/" class="logo-3d">
                    <img src="https://zeyvior.com/wp-content/uploads/2025/04/zeyvior-logo-1.png" alt="Zeyvior" class="logo-img">
                </a>
                <a href="https://zeyvior.com/" class="logo-text">Zeyvior</a>
            </div>
            <div class="nav-buttons">
                <a href="https://ai-analyzer.zeyvior.com/" class="nav-btn nav-btn-primary">Personalize Comparisons</a>
                <a href="../" class="nav-btn nav-btn-secondary">Similar Comparisons</a>
            </div>
        </div>
    </nav>

    <div class="container">
        <div class="intro">
            <h1>{{ title }}</h1>
            {{ intro_content | safe }}
        </div>

        <div class="comparison-table">
            <div class="table-header">
                <div class="aspect-header"></div>
                <div class="method-header">
                    <span class="method-emoji">💰</span>
                    <span class="method-name">{{ current_item1 }}</span>
                </div>
                <div class="method-header">
                    <span class="method-emoji">🛍️</span>
                    <span class="method-name">{{ current_item2 }}</span>
                </div>
            </div>

            {% for category in comparison_data %}
            <div class="comparison-row">
                <div class="aspect">{{ category.name }}</div>
                <div class="item1-details {% if category.winner == current_item1 %}winner-column{% endif %}">
                    <div class="item-content">{{ category.item1_details }}</div>
                    <div class="progress-container" data-score="{{ category.item1_score }}">
                        <div class="progress-bar"></div>
                    </div>
                    {% if category.winner == current_item1 %}
                    <div class="winner-indicator">
                        <span class="winner-emoji">🏆</span>
                        <span class="winner-text">Winner!</span>
                    </div>
                    {% endif %}
                </div>
                <div class="item2-details {% if category.winner == current_item2 %}winner-column{% endif %}">
                    <div class="item-content">{{ category.item2_details }}</div>
                    <div class="progress-container" data-score="{{ category.item2_score }}">
                        <div class="progress-bar"></div>
                    </div>
                    {% if category.winner == current_item2 %}
                    <div class="winner-indicator">
                        <span class="winner-emoji">🏆</span>
                        <span class="winner-text">Winner!</span>
                    </div>
                    {% endif %}
                </div>
            </div>
            {% endfor %}

            <div class="performance-row">
                <div class="performance-label">Performance</div>
                <div class="performance-metric">
                    <div class="metric-score">{{ "%.1f"|format(item1_performance) }}%</div>
                </div>
                <div class="performance-metric">
                    <div class="metric-score">{{ "%.1f"|format(item2_performance) }}%</div>
                </div>
            </div>
        </div>

        <div class="navigation-section">
            <h2 class="navigation-title">Similar Comparisons</h2>
            <nav class="navigation-grid">
                {% for link in content_3_links %}
                <a href="{{ link.url }}" class="nav-link">{{ link.text }}</a>
                {% endfor %}
            </nav>
        </div>

        <div class="content-6-section">
            <div class="content-6-container">
                <div class="content-6-text">{{ content_6 }}</div>
                <div class="zeyvior-cta-container">
                    <a href="https://zeyvior.com" class="zeyvior-button">
                        <div class="button-bg-animation"></div>
                        <div class="button-content">
                            <span class="zeyvior-icon">🤖</span>
                            <span class="zeyvior-text">Try Zeyvior</span>
                            <span class="zeyvior-sparkle">✨</span>
                        </div>
                    </a>
                </div>
            </div>
        </div>

        <div class="content-4-section">
            <div class="content-4-container">
                <div class="content-4-text">{{ content_4 }}</div>
                <div class="cta-button-container">
                    <a href="https://zeyvior.com/opportunity-for-newcomers/" class="cta-button">
                        <span class="button-icon">🚀</span>
                        <span class="button-text">Best Methods to Start Now!</span>
                        <span class="button-arrow">→</span>
                    </a>
                </div>
            </div>
        </div>

        <div class="content-5-section">
            <div class="content-5-container">
                <div class="comparison-cards">
                    {% for comparison in content_5_comparisons %}
                    <div class="comparison-card">
                        <div class="card-header">
                            <div class="category-icon">📊</div>
                            <h4>{{ comparison.category }}</h4>
                        </div>
                        <div class="comparison-text">{{ comparison.comparison }}</div>
                        <a href="{{ comparison.link }}" class="category-button">
                            <span class="button-text">{{ comparison.button_text }}</span>
                            <span class="button-arrow">→</span>
                        </a>
                    </div>
                    {% endfor %}
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-container">
            <div class="footer-links">
                <a href="https://zeyvior.com/privacy-policy/" class="footer-link">Privacy Policy</a>
                <a href="https://zeyvior.com/terms-and-conditions/" class="footer-link">Terms and Conditions</a>
                <a href="https://zeyvior.com/refund-policy/" class="footer-link">Refund Policy</a>
                <a href="https://zeyvior.com/about-us/" class="footer-link">About Us</a>
                <a href="https://zeyvior.com/contact-us/" class="footer-link">Contact Us</a>
            </div>
            <div class="footer-copyright">
                <p>&copy; 2025 Zeyvior. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <style>
        :root {
            --border-color: #e2e8f0;
            --primary-color: #3b82f6;
            --secondary-color: #10b981;
            --text-color: #1f2937;
            --grid-color: #f1f5f9;
            --winner-color: #10b981;
            --header-bg: #f8fafc;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }

        .comparison-table {
            position: relative;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            overflow: hidden;
            background-color: white;
            margin: 2rem 0;
        }

        .table-header {
            display: grid;
            grid-template-columns: 1fr 2fr 2fr;
            background-color: var(--header-bg);
            border-bottom: 2px solid var(--border-color);
        }

        .aspect-header, .method-header {
            padding: 1.5rem;
            font-weight: 600;
            color: var(--text-color);
            border-right: 1px solid var(--border-color);
        }

        .method-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            justify-content: center;
        }

        .method-header:last-child {
            border-right: none;
        }

        .method-emoji {
            font-size: 1.5rem;
        }

        .method-name {
            font-size: 1.25rem;
        }

        .comparison-row {
            display: grid;
            grid-template-columns: 1fr 2fr 2fr;
            border-bottom: 1px solid var(--border-color);
            transition: background-color 0.3s ease;
        }

        .comparison-row:hover {
            background-color: rgba(59, 130, 246, 0.05);
        }

        .aspect, .item1-details, .item2-details {
            padding: 1.5rem;
            border-right: 1px solid var(--border-color);
            position: relative;
        }

        .item2-details {
            border-right: none;
        }

        .winner-emoji {
            font-size: 1.25rem;
            filter: drop-shadow(0 0 2px rgba(255, 215, 0, 0.5));
        }

        .progress-container {
            width: 100%;
            height: 6px;
            background-color: #e2e8f0;
            border-radius: 3px;
            margin-top: 1rem;
            overflow: hidden;
            opacity: 0;
            transform: scaleX(0.8);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .progress-container.animate {
            opacity: 1;
            transform: scaleX(1);
        }

        .progress-bar {
            width: 0;
            height: 100%;
            background-color: var(--primary-color);
            border-radius: 3px;
            transition: width 1s ease-out;
        }

        .performance-row {
            display: grid;
            grid-template-columns: 1fr 2fr 2fr;
            background-color: var(--header-bg);
            border-top: 2px solid var(--border-color);
        }

        .performance-label, .performance-metric {
            padding: 1.5rem;
            border-right: 1px solid var(--border-color);
            text-align: center;
        }

        .performance-metric:last-child {
            border-right: none;
        }

        .performance-label {
            font-weight: 600;
            color: var(--text-color);
        }

        .metric-score {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary-color);
        }

        .winner-section {
            width: 100vw;
            margin-left: calc(-50vw + 50%);
            padding: 2rem;
            background-color: var(--header-bg);
            display: flex;
            justify-content: center;
        }

        .winner-card {
            background-color: white;
            border-radius: 8px;
            padding: 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 800px;
            width: 100%;
            text-align: center;
        }

        .winner-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }

        .trophy {
            font-size: 2rem;
        }

        .winner-name {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--winner-color);
        }

        .winner-reason {
            font-size: 1rem;
            color: var(--text-color);
            line-height: 1.6;
            text-align: center;
            max-width: 600px;
            margin: 0 auto;
        }

        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }

            .table-header, .comparison-row, .performance-row {
                grid-template-columns: 1fr 1.5fr 1.5fr;
            }

            .aspect-header, .method-header, .aspect, .item1-details, .item2-details, .performance-label, .performance-metric {
                padding: 1rem;
                font-size: 0.875rem;
            }

            .method-emoji {
                font-size: 1.25rem;
            }

            .method-name {
                font-size: 1rem;
            }

            .item-content {
                font-size: 0.8rem;
                line-height: 1.4;
            }

            .winner-indicator {
                margin-top: 0.5rem;
            }

            .winner-emoji {
                font-size: 1rem;
            }

            .winner-text {
                font-size: 0.7rem;
            }
        }

        @media (max-width: 480px) {
            .table-header, .comparison-row, .performance-row {
                grid-template-columns: 0.8fr 1.2fr 1.2fr;
            }

            .aspect-header, .method-header, .aspect, .item1-details, .item2-details, .performance-label, .performance-metric {
                padding: 0.75rem;
                font-size: 0.75rem;
            }

            .method-name {
                font-size: 0.875rem;
            }

            .item-content {
                font-size: 0.75rem;
            }
        }
    </style>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const progressContainers = document.querySelectorAll('.progress-container');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const container = entry.target;
                        const score = container.dataset.score;
                        container.classList.add('animate');
                        setTimeout(() => {
                            container.querySelector('.progress-bar').style.width = score + '%';
                        }, 100);
                    }
                });
            }, { threshold: 0.2 });

            progressContainers.forEach(container => observer.observe(container));
        });
    </script>
</body>
</html>
'''

def get_badge(score: float) -> str:
    if score >= 90:
        return "Perfect"
    elif score >= 75:
        return "Excellent"
    elif score >= 60:
        return "Good"
    elif score >= 40:
        return "Challenging"
    else:
        return "Difficult"

def generate_seo_intro(item1: str, item2: str) -> str:
    prompt = f'''Re-write this in a meaningful, engaging, and SEO-friendly way. Ensure content avoids triggering Google's YMYL (Your Money or Your Life) policy.

"Get the most accurate and unbiased AI-driven comparison of {item1} and {item2}. Unlike human opinions, Zeyvior AI analyzes real-time data and trends to give you the clearest answer on which is the better choice. Explore expert AI insights now!"'''

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=200
        )
        
        content = response['choices'][0]['message']['content'].strip()
        return f"<p>{content}</p>"
    except Exception as e:
        print(f"Error in generate_seo_intro: {str(e)}")
        return f"<p>Compare {item1} vs {item2} - A Comprehensive Analysis</p>"

def generate_comparison_data(item1: str, item2: str) -> Tuple[List[Dict], float, float, float, str]:
    categories = [
        "Ease of Starting & Doing",
        "Minimal or Zero Investment",
        "Scalability",
        "Passive Income Potential",
        "Market Demand",
        "Competition Level",
        "Immediate Earnings",
        "Long-Term Stability",
        "Risk of Failure",
        "Opportunity for Newcomers",
        "Adaptability to Changes",
        "Global Reach & Accessibility"
    ]
    
    prompt = f'''Compare {item1} vs {item2} across the following categories for COMPLETE BEGINNERS. For each category:

1. Provide separate descriptions for {item1} and {item2} (30-40 words each) focusing on beginner-friendliness.
2. Provide VERY CHALLENGING scores (20-60) for each option. Even excellent beginner methods should rarely exceed 60%.
3. Determine which option performs better for beginners in this category.

Remember: Be very strict with scoring. Starting any online method is extremely difficult for beginners.

Also provide a SHORT explanation (15-25 words) of why the overall winner is better for beginners.

Categories:
{chr(10).join(categories)}

Format the response as JSON with this structure:
{{
    "categories": [
        {{
            "name": "category name",
            "item1_details": "Specific details about {item1} for this category (beginner-focused)",
            "item2_details": "Specific details about {item2} for this category (beginner-focused)",
            "item1_score": 45,
            "item2_score": 52,
            "winner": "{item1} or {item2}"
        }}
    ],
    "overall_winner": "The overall better option for beginners",
    "winning_reason": "Short explanation why winner is better for beginners"
}}

IMPORTANT: 
- Respond ONLY with the JSON structure
- Focus on beginner-friendliness in all descriptions
- Scores should be very challenging (20-60 range maximum)
- Winner should be exactly "{item1}" or "{item2}" (no other variations)
- Winning reason should be SHORT (15-25 words only)'''

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that responds only in valid JSON format with detailed comparisons between two options."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500
        )
        
        content = response['choices'][0]['message']['content'].strip()
        print("API Response:", content)  # Debug print
        
        # Parse the JSON response
        data = json.loads(content)
        
        # Calculate individual performance metrics
        item1_performance = sum(cat['item1_score'] for cat in data['categories']) / len(data['categories'])
        item2_performance = sum(cat['item2_score'] for cat in data['categories']) / len(data['categories'])
        
        # Calculate the overall score based on performance difference
        overall_score = 50 + ((item1_performance - item2_performance) / 2)
        
        return data['categories'], overall_score, item1_performance, item2_performance, data['winning_reason']

    except Exception as e:
        print(f"Error in generate_comparison_data: {str(e)}")
        return [], 50.0, 50.0, 50.0, "Both methods have their unique advantages"

def generate_content_4(item1: str, item2: str, item1_score: float, item2_score: float) -> str:
    """Generate Content 4 using OpenAI with final scores"""
    
    prompt = f'''Re-write this in another meaningful way. Avoid words and phrases that might trigger Google YMYL policy.

"According to Zeyvior AI, {item1} scores {item1_score:.1f}%, while {item2} scores {item2_score:.1f}%—meaning neither is ideal right now. However, if you're a beginner with no clear direction, {item1 if item1_score > item2_score else item2} is the better choice. Want more options? Select one from the buttons below."'''

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=150
        )
        
        content = response['choices'][0]['message']['content'].strip()
        return content
    except Exception as e:
        print(f"Error in generate_content_4: {str(e)}")
        return f"Based on our analysis, {item1} achieved {item1_score:.1f}% while {item2} reached {item2_score:.1f}%. For beginners, {item1 if item1_score > item2_score else item2} offers better starting opportunities."

def generate_content_5(item1: str, item2: str) -> List[Dict]:
    """Generate Content 5 comparisons for 6 random categories"""
    
    all_categories = [
        {
            "name": "Ease of Starting & Doing",
            "link": "https://zeyvior.com/ease-of-starting/",
            "button_text": "Easiest Methods to Start"
        },
        {
            "name": "Minimal or Zero Investment", 
            "link": "https://zeyvior.com/minimal-investment/",
            "button_text": "Best Methods with Minimal Investment"
        },
        {
            "name": "Passive Income Potential",
            "link": "https://zeyvior.com/passive-income-potential/",
            "button_text": "Best Methods with Passive Income Potential"
        },
        {
            "name": "Market Demand",
            "link": "https://zeyvior.com/market-demand/",
            "button_text": "Best Methods with High Market Demand"
        },
        {
            "name": "Competition Level",
            "link": "https://zeyvior.com/competition-level/",
            "button_text": "Methods with Lowest Competition"
        },
        {
            "name": "Immediate Earnings",
            "link": "https://zeyvior.com/immediate-earnings/",
            "button_text": "Best Immediate Earning Methods"
        },
        {
            "name": "Risk of Failure",
            "link": "https://zeyvior.com/risk-of-failure/",
            "button_text": "Lowest Risk Methods to Start"
        },
        {
            "name": "Skills & Experience Needed",
            "link": "https://zeyvior.com/skills-and-experience/",
            "button_text": "Best Methods for your Skills"
        }
    ]
    
    # Randomly select 6 categories
    import random
    selected_categories = random.sample(all_categories, 6)
    
    comparisons = []
    
    for category in selected_categories:
        prompt = f'''Write a short comparison (30-40 words) between {item1} and {item2} specifically for "{category["name"]}" category. Focus on which method performs better and why. Do not include scores or percentages.'''
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=100
            )
            
            comparison_text = response['choices'][0]['message']['content'].strip()
            
            comparisons.append({
                "category": category["name"],
                "comparison": comparison_text,
                "link": category["link"],
                "button_text": category["button_text"]
            })
            
        except Exception as e:
            print(f"Error generating comparison for {category['name']}: {str(e)}")
            comparisons.append({
                "category": category["name"],
                "comparison": f"{item1} and {item2} both have their unique approaches to {category['name'].lower()}. Each method offers different advantages depending on your specific situation.",
                "link": category["link"],
                "button_text": category["button_text"]
            })
    
    return comparisons

def generate_content_3_links(item1: str, item2: str, all_items: List[str]) -> List[Dict]:
    """Generate Content 3 internal navigation links matching exactly the generated files"""
    import itertools
    
    navigation_links = []
    
    # Generate the same combinations that are actually created in main()
    # This ensures we only link to files that actually exist
    all_generated_combinations = list(itertools.combinations(all_items, 2))
    
    # Create links for all generated files except the current one
    current_pair = (item1, item2)
    current_pair_reverse = (item2, item1)
    
    for combo in all_generated_combinations:
        # Skip the current comparison
        if combo == current_pair or combo == current_pair_reverse:
            continue
            
        # Create link in the same order as generated
        url = f"{slugify(combo[0])}-vs-{slugify(combo[1])}.html"
        text = f"{combo[0]} vs {combo[1]}"
        
        navigation_links.append({
            'url': url,
            'text': text
        })
    
    # Limit to maximum 3 links and prioritize links containing current items
    priority_links = []
    other_links = []
    
    for link in navigation_links:
        # Check if link contains either of the current items
        if item1 in link['text'] or item2 in link['text']:
            priority_links.append(link)
        else:
            other_links.append(link)
    
    # Combine with priority links first, then others, max 3 total
    final_links = priority_links[:2] + other_links[:3-len(priority_links[:2])]
    
    return final_links[:3]

def generate_content_6(item1: str, item2: str) -> str:
    """Generate Content 6 using OpenAI with Zeyvior promotion"""
    
    prompt = f'''Re-write this in another meaningful way. Avoid words and phrases that might trigger Google YMYL policy.

"Want to compare {item1} vs. {item2} with real-time data, considering the latest news and trends? Zeyvior AI is the most reliable tool to give you accurate insights before deciding on your next online money-making strategy.
And if you need to compare anything else—whether it's financial markets, tech trends, or any topic in the universe—Zeyvior AI has you covered. Try it now and make smarter decisions with confidence!"'''

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=200
        )
        
        content = response['choices'][0]['message']['content'].strip()
        return content
    except Exception as e:
        print(f"Error in generate_content_6: {str(e)}")
        return f"Interested in exploring {item1} vs {item2} with current data and trends? Zeyvior AI provides comprehensive analysis to help you evaluate different opportunities. Whether you're comparing various methods or exploring new possibilities, Zeyvior AI offers detailed insights to support your decision-making process."

def generate_html_file(item1: str, item2: str, all_items: List[str]) -> str:
    # Generate the filename
    filename = f"{slugify(item1)}-vs-{slugify(item2)}.html"
    
    # Generate SEO intro
    intro_content = generate_seo_intro(item1, item2)
    
    # Generate comparison data
    comparison_data, overall_score, item1_performance, item2_performance, winning_reason = generate_comparison_data(item1, item2)
    
    # Generate Content 3 - Internal navigation links
    content_3_links = generate_content_3_links(item1, item2, all_items)
    
    # Generate Content 4
    content_4 = generate_content_4(item1, item2, item1_performance, item2_performance)
    
    # Generate Content 5
    content_5_comparisons = generate_content_5(item1, item2)
    
    # Generate Content 6
    content_6 = generate_content_6(item1, item2)
    
    # Create template
    template = Template(HTML_TEMPLATE)
    
    # Extract meta description from intro content (remove HTML tags and limit length)
    import re
    clean_intro = re.sub(r'<[^>]+>', '', intro_content)  # Remove HTML tags
    meta_description = clean_intro[:155] + "..." if len(clean_intro) > 155 else clean_intro
    
    # Render the HTML
    html_content = template.render(
        title=f"{item1} vs {item2} [AI Analysis]",
        meta_description=meta_description,
        intro_content=intro_content,
        comparison_data=comparison_data,
        overall_score=round(overall_score, 2),
        item1_performance=round(item1_performance, 2),
        item2_performance=round(item2_performance, 2),
        winning_reason=winning_reason,
        content_3_links=content_3_links,
        content_4=content_4,
        content_5_comparisons=content_5_comparisons,
        content_6=content_6,
        current_item1=item1,
        current_item2=item2
    )
    
    return html_content

def main(keywords: List[str]):
    if len(keywords) < 2:
        print("Please provide at least 2 keywords to compare")
        sys.exit(1)
    
    # Create output directory
    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)
    
    # Copy CSS file
    css_source = Path("static/styles.css")
    css_dest = output_dir / "styles.css"
    css_dest.write_text(css_source.read_text())
    
    # Generate all combinations
    files_generated = []
    for item1, item2 in itertools.combinations(keywords, 2):
        html_content = generate_html_file(item1, item2, keywords)
        filename = f"{slugify(item1)}-vs-{slugify(item2)}.html"
        output_file = output_dir / filename
        output_file.write_text(html_content)
        files_generated.append(filename)
        print(f"Generated: {filename}")
    
    # Create ZIP file
    zip_filename = "comparison_pages.zip"
    with zipfile.ZipFile(zip_filename, 'w') as zipf:
        # Add CSS file
        zipf.write(css_dest, "styles.css")
        # Add HTML files
        for filename in files_generated:
            zipf.write(output_dir / filename, filename)
    
    print(f"\nAll files have been generated and packaged in {zip_filename}")

if __name__ == "__main__":
    keywords = sys.argv[1:]
    main(keywords) 