/**
 * Social Media Ad Builder Module
 * Version: 1.0.0 - January 17, 2026
 * Comprehensive ad generator for all major social platforms
 */

window.SocialMediaBuilder = (function() {
    'use strict';

    // ==================== PLATFORM SPECIFICATIONS ====================
    const PLATFORM_SPECS = {
        meta: {
            name: 'Meta (Facebook/Instagram)',
            icon: 'meta',
            color: '#1877F2',
            adTypes: {
                feed: {
                    name: 'Feed Ad',
                    fields: {
                        primaryText: { label: 'Primary Text', max: 600, optimal: 125, mobileSafe: 90 },
                        headline: { label: 'Headline', max: 255, optimal: 40 },
                        description: { label: 'Link Description', max: 30, optimal: 27 }
                    }
                },
                carousel: {
                    name: 'Carousel Ad',
                    fields: {
                        primaryText: { label: 'Primary Text', max: 600, optimal: 125 },
                        cardHeadline: { label: 'Card Headline', max: 45, optimal: 32, count: 10 },
                        cardDescription: { label: 'Card Description', max: 30, optimal: 18, count: 10 }
                    }
                },
                stories: {
                    name: 'Stories/Reels Ad',
                    fields: {
                        primaryText: { label: 'Text Overlay', max: 125, optimal: 72 },
                        headline: { label: 'CTA Text', max: 40, optimal: 20 }
                    }
                },
                instagram: {
                    name: 'Instagram Post',
                    fields: {
                        caption: { label: 'Caption', max: 2200, optimal: 125 },
                        hashtags: { label: 'Hashtags', max: 30, optimal: 10, isHashtags: true }
                    }
                }
            },
            ctas: ['Shop Now', 'Learn More', 'Sign Up', 'Download', 'Get Offer', 'Book Now', 'Contact Us', 'Subscribe', 'Apply Now', 'Get Quote'],
            policies: {
                superlatives: 'warning',
                beforeAfter: 'restricted',
                youLanguage: 'restricted',
                excessiveCaps: 'restricted',
                emojis: 'allowed'
            }
        },
        linkedin: {
            name: 'LinkedIn',
            icon: 'linkedin',
            color: '#0A66C2',
            adTypes: {
                singleImage: {
                    name: 'Single Image Ad',
                    fields: {
                        introText: { label: 'Intro Text', max: 600, optimal: 150 },
                        headline: { label: 'Headline', max: 200, optimal: 70 }
                    }
                },
                video: {
                    name: 'Video Ad',
                    fields: {
                        introText: { label: 'Intro Text', max: 600, optimal: 150 },
                        headline: { label: 'Headline', max: 200, optimal: 70 }
                    }
                },
                carousel: {
                    name: 'Carousel Ad',
                    fields: {
                        introText: { label: 'Intro Text', max: 255, optimal: 150 },
                        cardHeadline: { label: 'Card Headline', max: 45, optimal: 30, count: 10 }
                    }
                },
                textAd: {
                    name: 'Text Ad',
                    fields: {
                        headline: { label: 'Headline', max: 25 },
                        description: { label: 'Description', max: 75 }
                    }
                },
                messageAd: {
                    name: 'Message Ad (InMail)',
                    fields: {
                        subject: { label: 'Subject Line', max: 60 },
                        body: { label: 'Message Body', max: 1000, optimal: 500 }
                    }
                },
                spotlight: {
                    name: 'Spotlight Ad',
                    fields: {
                        headline: { label: 'Headline', max: 50 },
                        description: { label: 'Description', max: 70 }
                    }
                }
            },
            ctas: ['Learn More', 'Sign Up', 'Download', 'Register', 'Apply', 'Request Demo', 'Get Quote', 'Subscribe', 'Contact Us'],
            policies: {
                superlatives: 'warning',
                beforeAfter: 'warning',
                youLanguage: 'allowed',
                excessiveCaps: 'restricted',
                emojis: 'warning'
            }
        },
        twitter: {
            name: 'X (Twitter)',
            icon: 'twitter',
            color: '#000000',
            adTypes: {
                promotedTweet: {
                    name: 'Promoted Tweet',
                    fields: {
                        tweetCopy: { label: 'Tweet Copy', max: 280, optimal: 100 },
                        headline: { label: 'Card Headline', max: 23 }
                    }
                },
                websiteCard: {
                    name: 'Website Card',
                    fields: {
                        tweetCopy: { label: 'Tweet Copy', max: 280, optimal: 100 },
                        headline: { label: 'Card Title', max: 70 },
                        description: { label: 'Card Description', max: 200 }
                    }
                },
                videoAd: {
                    name: 'Video Ad',
                    fields: {
                        tweetCopy: { label: 'Tweet Copy', max: 280, optimal: 100 },
                        headline: { label: 'Headline', max: 70 }
                    }
                }
            },
            ctas: ['Learn More', 'Shop Now', 'Sign Up', 'Install', 'Book Now'],
            policies: {
                superlatives: 'warning',
                beforeAfter: 'warning',
                youLanguage: 'allowed',
                excessiveCaps: 'restricted',
                emojis: 'allowed'
            }
        },
        youtube: {
            name: 'YouTube',
            icon: 'youtube',
            color: '#FF0000',
            adTypes: {
                inStream: {
                    name: 'In-Stream Ad (Skippable)',
                    fields: {
                        headline: { label: 'Headline', max: 40 },
                        description1: { label: 'Description Line 1', max: 35 },
                        description2: { label: 'Description Line 2', max: 35 },
                        displayUrl: { label: 'Display URL', max: 35 }
                    }
                },
                bumper: {
                    name: 'Bumper Ad (6 sec)',
                    fields: {
                        companionHeadline: { label: 'Companion Headline', max: 25 },
                        companionDescription: { label: 'Companion Description', max: 35 }
                    }
                },
                discovery: {
                    name: 'Discovery Ad',
                    fields: {
                        headline: { label: 'Headline', max: 100, optimal: 70 },
                        description1: { label: 'Description Line 1', max: 35 },
                        description2: { label: 'Description Line 2', max: 35 }
                    }
                },
                shorts: {
                    name: 'Shorts Ad',
                    fields: {
                        headline: { label: 'Headline', max: 100, optimal: 70 },
                        description: { label: 'Description', max: 90 }
                    }
                }
            },
            ctas: ['Visit Site', 'Shop Now', 'Learn More', 'Sign Up', 'Get Offer'],
            policies: {
                superlatives: 'warning',
                beforeAfter: 'warning',
                youLanguage: 'allowed',
                excessiveCaps: 'restricted',
                emojis: 'restricted'
            }
        },
        tiktok: {
            name: 'TikTok',
            icon: 'tiktok',
            color: '#000000',
            adTypes: {
                inFeed: {
                    name: 'In-Feed Ad',
                    fields: {
                        adText: { label: 'Ad Text', max: 100, optimal: 80 },
                        displayName: { label: 'Display Name', max: 20 }
                    },
                    notes: '68% watch on mute - use text overlays'
                },
                topView: {
                    name: 'TopView Ad',
                    fields: {
                        adText: { label: 'Ad Text', max: 100 },
                        displayName: { label: 'Display Name', max: 20 }
                    }
                },
                spark: {
                    name: 'Spark Ad (Boosted Post)',
                    fields: {
                        caption: { label: 'Caption', max: 4000, optimal: 150 }
                    }
                }
            },
            ctas: ['Shop Now', 'Learn More', 'Sign Up', 'Download', 'Contact Us', 'Apply Now'],
            policies: {
                superlatives: 'warning',
                beforeAfter: 'restricted',
                youLanguage: 'warning',
                excessiveCaps: 'restricted',
                emojis: 'restricted'
            }
        },
        pinterest: {
            name: 'Pinterest',
            icon: 'pinterest',
            color: '#E60023',
            adTypes: {
                standardPin: {
                    name: 'Standard Pin Ad',
                    fields: {
                        title: { label: 'Pin Title', max: 100, optimal: 40 },
                        description: { label: 'Pin Description', max: 500, optimal: 200 }
                    }
                },
                videoPin: {
                    name: 'Video Pin Ad',
                    fields: {
                        title: { label: 'Pin Title', max: 100, optimal: 40 },
                        description: { label: 'Pin Description', max: 500, optimal: 200 }
                    }
                },
                carousel: {
                    name: 'Carousel Pin',
                    fields: {
                        title: { label: 'Pin Title', max: 100, optimal: 40 },
                        cardTitle: { label: 'Card Title', max: 100, count: 5 },
                        description: { label: 'Description', max: 500 }
                    }
                },
                idea: {
                    name: 'Idea Pin Ad',
                    fields: {
                        title: { label: 'Pin Title', max: 100 },
                        pageTitle: { label: 'Page Titles', max: 250, count: 20 }
                    }
                }
            },
            ctas: ['Learn More', 'Shop', 'Install', 'Sign Up'],
            policies: {
                superlatives: 'allowed',
                beforeAfter: 'allowed',
                youLanguage: 'allowed',
                excessiveCaps: 'warning',
                emojis: 'allowed'
            }
        },
        snapchat: {
            name: 'Snapchat',
            icon: 'snapchat',
            color: '#FFFC00',
            adTypes: {
                singleImage: {
                    name: 'Single Image/Video Ad',
                    fields: {
                        headline: { label: 'Headline', max: 34 },
                        brandName: { label: 'Brand Name', max: 25 }
                    }
                },
                story: {
                    name: 'Story Ad',
                    fields: {
                        headline: { label: 'Tile Headline', max: 34 },
                        brandName: { label: 'Brand Name', max: 25 }
                    }
                },
                collection: {
                    name: 'Collection Ad',
                    fields: {
                        headline: { label: 'Headline', max: 34 },
                        tileHeadline: { label: 'Tile Headlines', max: 34, count: 4 }
                    }
                }
            },
            ctas: ['Shop Now', 'View', 'Install', 'Sign Up', 'Watch'],
            policies: {
                superlatives: 'warning',
                beforeAfter: 'warning',
                youLanguage: 'allowed',
                excessiveCaps: 'restricted',
                emojis: 'allowed'
            }
        },
        threads: {
            name: 'Threads',
            icon: 'threads',
            color: '#000000',
            adTypes: {
                organic: {
                    name: 'Organic Post',
                    fields: {
                        postText: { label: 'Post Text', max: 500, optimal: 250 }
                    }
                }
            },
            ctas: [],
            policies: {
                superlatives: 'allowed',
                beforeAfter: 'allowed',
                youLanguage: 'allowed',
                excessiveCaps: 'warning',
                emojis: 'allowed'
            }
        }
    };

    // ==================== COPY FRAMEWORKS ====================
    const COPY_FRAMEWORKS = {
        pas: {
            name: 'PAS (Problem-Agitate-Solution)',
            description: 'Best for pain-point driven offers',
            structure: ['Problem', 'Agitate', 'Solution'],
            prompt: 'Start with the problem, amplify the pain, then present the solution'
        },
        aida: {
            name: 'AIDA (Attention-Interest-Desire-Action)',
            description: 'Best for full-funnel journeys',
            structure: ['Attention', 'Interest', 'Desire', 'Action'],
            prompt: 'Grab attention, build interest, create desire, drive action'
        },
        bab: {
            name: 'BAB (Before-After-Bridge)',
            description: 'Best for transformation offers',
            structure: ['Before', 'After', 'Bridge'],
            prompt: 'Show the before state, paint the after picture, bridge with your solution'
        },
        fourPs: {
            name: '4Ps (Promise-Picture-Proof-Push)',
            description: 'Best for high-ticket purchases',
            structure: ['Promise', 'Picture', 'Proof', 'Push'],
            prompt: 'Make a promise, paint the picture, provide proof, push to action'
        },
        fab: {
            name: 'FAB (Feature-Advantage-Benefit)',
            description: 'Best for product-focused ads',
            structure: ['Feature', 'Advantage', 'Benefit'],
            prompt: 'State the feature, explain the advantage, highlight the benefit to the user'
        },
        pastor: {
            name: 'PASTOR (Problem-Amplify-Story-Transformation-Offer-Response)',
            description: 'Best for long-form content',
            structure: ['Problem', 'Amplify', 'Story', 'Transformation', 'Offer', 'Response'],
            prompt: 'Deep dive into the problem, tell a story, show transformation, make an offer'
        }
    };

    // ==================== FUNNEL STAGES ====================
    const FUNNEL_STAGES = {
        tofu: {
            name: 'TOFU (Top of Funnel)',
            goal: 'Educate & Intrigue',
            tone: 'Curiosity-driven, broad appeal',
            ctas: ['Learn More', 'See How', 'Discover', 'Find Out', 'Explore']
        },
        mofu: {
            name: 'MOFU (Middle of Funnel)',
            goal: 'Build Trust & Differentiate',
            tone: 'Value-focused, proof-heavy',
            ctas: ['Compare', 'Get the Guide', 'Watch Demo', 'See Case Study', 'Download']
        },
        bofu: {
            name: 'BOFU (Bottom of Funnel)',
            goal: 'Convert',
            tone: 'Urgency, specificity',
            ctas: ['Get Started', 'Claim Offer', 'Buy Now', 'Start Free Trial', 'Book Now']
        }
    };

    // ==================== POWER WORDS ====================
    const POWER_WORDS = {
        urgency: ['Now', 'Today', 'Limited', 'Last Chance', 'Ends Soon', "Don't Miss", 'Hurry', 'Final'],
        exclusivity: ['Only', 'Exclusive', 'Members-Only', 'VIP', 'Insider', 'First Access', 'Private', 'Elite'],
        value: ['Free', 'Save', 'Bonus', 'Guaranteed', 'No-Risk', 'Proven', 'Best', 'Premium'],
        curiosity: ['Secret', 'Discover', 'Unlock', 'Revealed', 'Little-Known', 'Hidden', 'Surprising', 'Unknown'],
        trust: ['Certified', 'Official', 'Trusted', 'Award-Winning', '#1', 'Recommended', 'Verified', 'Authentic'],
        results: ['Instant', 'Fast', 'Easy', 'Effortless', 'Simple', 'Quick', 'Powerful', 'Effective']
    };

    // ==================== HEADLINE TYPES ====================
    const HEADLINE_TYPES = [
        { type: 'benefit', example: 'Save 30% on Your Energy Bill', prompt: 'Focus on the main benefit to the user' },
        { type: 'feature', example: 'AI-Powered Analytics Dashboard', prompt: 'Highlight a key product feature' },
        { type: 'question', example: 'Tired of Wasting Ad Spend?', prompt: 'Ask a question that resonates with pain points' },
        { type: 'howTo', example: 'How to Double Your ROAS in 30 Days', prompt: 'Promise to teach something valuable' },
        { type: 'socialProof', example: 'Trusted by 10,000+ Marketers', prompt: 'Use numbers and credibility' },
        { type: 'urgency', example: 'Limited Time: Free Audit', prompt: 'Create time pressure' },
        { type: 'brand', example: 'Acme Solutions | Since 2010', prompt: 'Lead with brand recognition' },
        { type: 'cta', example: 'Get Your Free Quote Today', prompt: 'Lead with the action' }
    ];

    // ==================== STATE ====================
    let builder = {
        selectedPlatform: 'meta',
        selectedAdType: 'feed',
        selectedFramework: 'pas',
        selectedFunnel: 'tofu',
        brandVoice: {
            tone: 'professional',
            humor: 'none',
            technicalDepth: 'simple',
            pronouns: 'you',
            forbiddenWords: '',
            requiredDisclaimers: ''
        },
        variations: 1,
        generatedAds: [],
        savedCampaigns: []
    };

    // ==================== UI CREATION ====================
    function createUI(state) {
        const platform = PLATFORM_SPECS[state.selectedPlatform];
        const adType = platform.adTypes[state.selectedAdType];

        return `
<style>
.smb-container { font-family: 'Inter', -apple-system, sans-serif; color: #e5e7eb; max-width: 1400px; margin: 0 auto; padding: 24px; }
.smb-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #374151; }
.smb-logo { width: 48px; height: 48px; color: #9ca3af; }
.smb-header h1 { font-size: 28px; font-weight: 700; color: #f9fafb; margin: 0; }
.smb-header p { color: #9ca3af; margin: 4px 0 0 0; font-size: 14px; }

.smb-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
@media (max-width: 1024px) { .smb-grid { grid-template-columns: 1fr; } }

.smb-card { background: #1f2937; border-radius: 12px; padding: 24px; border: 1px solid #374151; }
.smb-card-title { font-size: 16px; font-weight: 600; color: #f9fafb; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px; }
.smb-card-title svg { width: 20px; height: 20px; color: #60a5fa; }

/* Platform Grid */
.smb-platform-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
@media (max-width: 768px) { .smb-platform-grid { grid-template-columns: repeat(2, 1fr); } }
.smb-platform-btn { background: #111827; border: 2px solid #374151; border-radius: 8px; padding: 12px 8px; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.smb-platform-btn:hover { border-color: #4b5563; background: #1f2937; }
.smb-platform-btn.active { border-color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
.smb-platform-btn svg { width: 24px; height: 24px; }
.smb-platform-btn span { font-size: 11px; color: #9ca3af; text-align: center; }
.smb-platform-btn.active span { color: #60a5fa; }

/* Ad Type Pills */
.smb-adtype-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.smb-adtype-pill { background: #111827; border: 1px solid #374151; border-radius: 20px; padding: 8px 16px; font-size: 13px; color: #9ca3af; cursor: pointer; transition: all 0.2s; }
.smb-adtype-pill:hover { border-color: #4b5563; color: #e5e7eb; }
.smb-adtype-pill.active { background: #3b82f6; border-color: #3b82f6; color: white; }

/* Form Elements */
.smb-form-group { margin-bottom: 16px; }
.smb-label { display: block; font-size: 13px; font-weight: 500; color: #9ca3af; margin-bottom: 6px; }
.smb-label-info { font-weight: 400; color: #6b7280; }
.smb-input { width: 100%; background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 12px; color: #e5e7eb; font-size: 14px; resize: vertical; box-sizing: border-box; }
.smb-input:focus { outline: none; border-color: #3b82f6; }
.smb-input::placeholder { color: #4b5563; }
.smb-textarea { min-height: 80px; }
.smb-char-count { font-size: 11px; color: #6b7280; text-align: right; margin-top: 4px; }
.smb-char-count.warning { color: #f59e0b; }
.smb-char-count.error { color: #ef4444; }

.smb-select { width: 100%; background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 12px; color: #e5e7eb; font-size: 14px; cursor: pointer; }
.smb-select:focus { outline: none; border-color: #3b82f6; }

/* Two Column Form */
.smb-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 600px) { .smb-form-row { grid-template-columns: 1fr; } }

/* Framework Cards */
.smb-framework-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
@media (max-width: 600px) { .smb-framework-grid { grid-template-columns: repeat(2, 1fr); } }
.smb-framework-btn { background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 10px; cursor: pointer; transition: all 0.2s; text-align: left; }
.smb-framework-btn:hover { border-color: #4b5563; }
.smb-framework-btn.active { border-color: #10b981; background: rgba(16, 185, 129, 0.1); }
.smb-framework-btn strong { display: block; font-size: 12px; color: #f9fafb; margin-bottom: 2px; }
.smb-framework-btn span { font-size: 10px; color: #6b7280; }

/* Funnel Buttons */
.smb-funnel-btns { display: flex; gap: 8px; }
.smb-funnel-btn { flex: 1; background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 12px 8px; cursor: pointer; transition: all 0.2s; text-align: center; }
.smb-funnel-btn:hover { border-color: #4b5563; }
.smb-funnel-btn.active { border-color: #8b5cf6; background: rgba(139, 92, 246, 0.1); }
.smb-funnel-btn strong { display: block; font-size: 13px; color: #f9fafb; }
.smb-funnel-btn span { font-size: 10px; color: #6b7280; }

/* Brand Voice */
.smb-voice-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }

/* Power Words */
.smb-power-section { margin-top: 16px; }
.smb-power-category { margin-bottom: 12px; }
.smb-power-category-title { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; margin-bottom: 6px; }
.smb-power-words { display: flex; flex-wrap: wrap; gap: 4px; }
.smb-power-word { background: #111827; border: 1px solid #374151; border-radius: 4px; padding: 4px 8px; font-size: 11px; color: #9ca3af; cursor: pointer; transition: all 0.15s; }
.smb-power-word:hover { border-color: #60a5fa; color: #60a5fa; }

/* Generate Button */
.smb-generate-btn { width: 100%; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); border: none; border-radius: 10px; padding: 16px 24px; font-size: 16px; font-weight: 600; color: white; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 20px; }
.smb-generate-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3); }
.smb-generate-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.smb-generate-btn svg { width: 20px; height: 20px; }

/* Results Section */
.smb-results { margin-top: 24px; }
.smb-result-card { background: #111827; border: 1px solid #374151; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
.smb-result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #374151; }
.smb-result-title { font-size: 14px; font-weight: 600; color: #f9fafb; }
.smb-result-badge { background: #374151; padding: 4px 10px; border-radius: 12px; font-size: 11px; color: #9ca3af; }

.smb-field-group { margin-bottom: 16px; }
.smb-field-label { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center; }
.smb-field-chars { font-weight: 400; }
.smb-field-content { background: #1f2937; border: 1px solid #374151; border-radius: 8px; padding: 12px; color: #e5e7eb; font-size: 14px; line-height: 1.5; position: relative; }
.smb-field-content:hover { border-color: #4b5563; }

.smb-copy-btn { position: absolute; top: 8px; right: 8px; background: #374151; border: none; border-radius: 4px; padding: 4px 8px; font-size: 10px; color: #9ca3af; cursor: pointer; opacity: 0; transition: opacity 0.2s; }
.smb-field-content:hover .smb-copy-btn { opacity: 1; }
.smb-copy-btn:hover { background: #4b5563; color: white; }

/* Policy Warning */
.smb-policy-warning { background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; border-radius: 8px; padding: 12px; margin-top: 12px; display: flex; align-items: flex-start; gap: 10px; }
.smb-policy-warning svg { width: 18px; height: 18px; color: #f59e0b; flex-shrink: 0; margin-top: 2px; }
.smb-policy-warning p { margin: 0; font-size: 12px; color: #fbbf24; }

/* Actions Row */
.smb-actions { display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap; }
.smb-action-btn { background: #374151; border: 1px solid #4b5563; border-radius: 8px; padding: 10px 16px; font-size: 13px; color: #e5e7eb; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
.smb-action-btn:hover { background: #4b5563; }
.smb-action-btn svg { width: 16px; height: 16px; }
.smb-action-btn.primary { background: #3b82f6; border-color: #3b82f6; }
.smb-action-btn.primary:hover { background: #2563eb; }

/* Refine Section */
.smb-refine-section { background: #111827; border: 1px solid #374151; border-radius: 12px; padding: 20px; margin-top: 20px; }
.smb-refine-title { font-size: 14px; font-weight: 600; color: #f9fafb; margin: 0 0 12px 0; }
.smb-refine-checkboxes { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.smb-refine-check { display: flex; align-items: center; gap: 6px; background: #1f2937; border: 1px solid #374151; border-radius: 6px; padding: 8px 12px; cursor: pointer; transition: all 0.2s; }
.smb-refine-check:hover { border-color: #4b5563; }
.smb-refine-check.selected { border-color: #8b5cf6; background: rgba(139, 92, 246, 0.1); }
.smb-refine-check input { display: none; }
.smb-refine-check span { font-size: 12px; color: #9ca3af; }
.smb-refine-check.selected span { color: #c4b5fd; }

/* Saved Campaigns */
.smb-saved-list { max-height: 300px; overflow-y: auto; }
.smb-saved-item { background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 12px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s; }
.smb-saved-item:hover { border-color: #4b5563; }
.smb-saved-item-header { display: flex; justify-content: space-between; align-items: center; }
.smb-saved-item-title { font-size: 13px; font-weight: 500; color: #f9fafb; }
.smb-saved-item-meta { font-size: 11px; color: #6b7280; }
.smb-saved-item-platform { display: inline-flex; align-items: center; gap: 4px; background: #374151; padding: 2px 8px; border-radius: 4px; font-size: 10px; color: #9ca3af; margin-top: 6px; }

/* Loading */
.smb-loading { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 40px; color: #9ca3af; }
.smb-spinner { width: 24px; height: 24px; border: 3px solid #374151; border-top-color: #3b82f6; border-radius: 50%; animation: smb-spin 1s linear infinite; }
@keyframes smb-spin { to { transform: rotate(360deg); } }

/* Empty State */
.smb-empty { text-align: center; padding: 40px; color: #6b7280; }
.smb-empty svg { width: 48px; height: 48px; margin-bottom: 12px; opacity: 0.5; }
.smb-empty p { margin: 0; font-size: 14px; }
</style>

<div class="smb-container">
    <div class="smb-header">
        <svg class="smb-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
        </svg>
        <div>
            <h1>Social Media Ad Builder</h1>
            <p>Generate platform-optimized ads with AI-powered copy frameworks</p>
        </div>
    </div>

    <div class="smb-grid">
        <!-- Left Column: Configuration -->
        <div>
            <!-- Platform Selection -->
            <div class="smb-card">
                <h3 class="smb-card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    Select Platform
                </h3>
                <div class="smb-platform-grid">
                    ${Object.entries(PLATFORM_SPECS).map(([key, plat]) => `
                        <button type="button" class="smb-platform-btn ${state.selectedPlatform === key ? 'active' : ''}" data-platform="${key}">
                            ${getPlatformIcon(key)}
                            <span>${plat.name.split('(')[0].trim()}</span>
                        </button>
                    `).join('')}
                </div>

                <div class="smb-adtype-pills" id="smb-adtype-pills">
                    ${Object.entries(platform.adTypes).map(([key, type]) => `
                        <button type="button" class="smb-adtype-pill ${state.selectedAdType === key ? 'active' : ''}" data-adtype="${key}">${type.name}</button>
                    `).join('')}
                </div>
            </div>

            <!-- Business Information -->
            <div class="smb-card" style="margin-top: 16px;">
                <h3 class="smb-card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7h-9M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
                    Campaign Details
                </h3>
                
                <div class="smb-form-row">
                    <div class="smb-form-group">
                        <label class="smb-label">Brand/Company Name</label>
                        <input type="text" class="smb-input" id="smb-brand-name" placeholder="Your Brand">
                    </div>
                    <div class="smb-form-group">
                        <label class="smb-label">Industry</label>
                        <select class="smb-select" id="smb-industry">
                            <option value="">Select Industry</option>
                            <option value="ecommerce">E-commerce/Retail</option>
                            <option value="saas">SaaS/Technology</option>
                            <option value="finance">Finance/Insurance</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="education">Education</option>
                            <option value="realestate">Real Estate</option>
                            <option value="travel">Travel/Hospitality</option>
                            <option value="food">Food & Beverage</option>
                            <option value="fitness">Fitness/Wellness</option>
                            <option value="beauty">Beauty/Fashion</option>
                            <option value="automotive">Automotive</option>
                            <option value="b2b">B2B Services</option>
                            <option value="agency">Agency/Marketing</option>
                            <option value="nonprofit">Non-Profit</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                <div class="smb-form-group">
                    <label class="smb-label">Product/Service</label>
                    <input type="text" class="smb-input" id="smb-product" placeholder="What are you promoting?">
                </div>

                <div class="smb-form-group">
                    <label class="smb-label">Target Audience</label>
                    <input type="text" class="smb-input" id="smb-audience" placeholder="e.g., Small business owners, 25-45, US">
                </div>

                <div class="smb-form-group">
                    <label class="smb-label">Key Benefits/USPs <span class="smb-label-info">(one per line)</span></label>
                    <textarea class="smb-input smb-textarea" id="smb-benefits" placeholder="Fast shipping&#10;24/7 support&#10;Money-back guarantee"></textarea>
                </div>

                <div class="smb-form-group">
                    <label class="smb-label">Offer/Promotion <span class="smb-label-info">(optional)</span></label>
                    <input type="text" class="smb-input" id="smb-offer" placeholder="e.g., 20% off, Free trial, Limited time">
                </div>

                <div class="smb-form-group">
                    <label class="smb-label">Landing Page URL</label>
                    <input type="text" class="smb-input" id="smb-url" placeholder="https://example.com/landing">
                </div>
            </div>

            <!-- Copy Framework -->
            <div class="smb-card" style="margin-top: 16px;">
                <h3 class="smb-card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    Copy Framework
                </h3>
                <div class="smb-framework-grid">
                    ${Object.entries(COPY_FRAMEWORKS).map(([key, fw]) => `
                        <button type="button" class="smb-framework-btn ${state.selectedFramework === key ? 'active' : ''}" data-framework="${key}">
                            <strong>${key.toUpperCase()}</strong>
                            <span>${fw.description.replace('Best for ', '')}</span>
                        </button>
                    `).join('')}
                </div>
            </div>

            <!-- Funnel Stage -->
            <div class="smb-card" style="margin-top: 16px;">
                <h3 class="smb-card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                    Funnel Stage
                </h3>
                <div class="smb-funnel-btns">
                    ${Object.entries(FUNNEL_STAGES).map(([key, stage]) => `
                        <button type="button" class="smb-funnel-btn ${state.selectedFunnel === key ? 'active' : ''}" data-funnel="${key}">
                            <strong>${key.toUpperCase()}</strong>
                            <span>${stage.goal}</span>
                        </button>
                    `).join('')}
                </div>
            </div>

            <!-- Brand Voice -->
            <div class="smb-card" style="margin-top: 16px;">
                <h3 class="smb-card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                    Brand Voice
                </h3>
                <div class="smb-voice-grid">
                    <div class="smb-form-group">
                        <label class="smb-label">Tone</label>
                        <select class="smb-select" id="smb-tone">
                            <option value="professional">Professional</option>
                            <option value="casual">Casual/Friendly</option>
                            <option value="bold">Bold/Confident</option>
                            <option value="empathetic">Empathetic/Caring</option>
                            <option value="playful">Playful/Fun</option>
                            <option value="luxurious">Luxurious/Premium</option>
                            <option value="urgent">Urgent/Action-Driven</option>
                        </select>
                    </div>
                    <div class="smb-form-group">
                        <label class="smb-label">Variations</label>
                        <select class="smb-select" id="smb-variations">
                            <option value="1">1 variation</option>
                            <option value="2">2 variations</option>
                            <option value="3" selected>3 variations</option>
                            <option value="5">5 variations</option>
                            <option value="8">8 variations</option>
                            <option value="10">10 variations</option>
                        </select>
                    </div>
                </div>

                <div class="smb-power-section">
                    <div class="smb-power-category-title">Power Words (click to add)</div>
                    ${Object.entries(POWER_WORDS).slice(0, 3).map(([cat, words]) => `
                        <div class="smb-power-category">
                            <div class="smb-power-words">
                                ${words.slice(0, 6).map(w => `<span class="smb-power-word" data-word="${w}">${w}</span>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Generate Button -->
            <!-- AI Model Selector -->
            <div id="smb-model-selector" style="margin-bottom: 16px;"></div>
            
            <button type="button" class="smb-generate-btn" id="smb-generate-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Generate ${platform.name.split('(')[0].trim()} Ads
            </button>
        </div>

        <!-- Right Column: Results -->
        <div>
            <div class="smb-card">
                <h3 class="smb-card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Generated Ads
                    <span style="margin-left: auto; font-size: 12px; font-weight: 400; color: #6b7280;">${adType.name} • ${platform.name}</span>
                </h3>

                <div id="smb-results">
                    <div class="smb-empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                        <p>Configure your campaign and click Generate to create platform-optimized ad copy</p>
                    </div>
                </div>

                <!-- Refine Section (shown after generation) -->
                <div class="smb-refine-section" id="smb-refine-section" style="display: none;">
                    <h4 class="smb-refine-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Refine with AI</h4>
                    <div class="smb-refine-checkboxes" id="smb-refine-checkboxes">
                        <!-- Populated dynamically -->
                    </div>
                    <div class="smb-form-group">
                        <textarea class="smb-input smb-textarea" id="smb-refine-input" placeholder="Add context for refinement (e.g., 'Make it more urgent', 'Add social proof')"></textarea>
                    </div>
                    <button type="button" class="smb-action-btn primary" id="smb-refine-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        Refine Selected
                    </button>
                </div>

                <!-- Export Actions -->
                <div class="smb-actions" id="smb-export-actions" style="display: none;">
                    <button type="button" class="smb-action-btn" id="smb-copy-all">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        Copy All
                    </button>
                    <button type="button" class="smb-action-btn" id="smb-export-csv">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Export CSV
                    </button>
                    <button type="button" class="smb-action-btn primary" id="smb-save-campaign">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        Save to CRM
                    </button>
                </div>
            </div>

            <!-- Saved Campaigns -->
            <div class="smb-card" style="margin-top: 16px;">
                <h3 class="smb-card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                    Saved Campaigns
                </h3>
                <div class="smb-saved-list" id="smb-saved-list">
                    ${renderSavedCampaigns()}
                </div>
            </div>
        </div>
    </div>
</div>`;
    }

    // ==================== PLATFORM ICONS ====================
    function getPlatformIcon(platform) {
        const icons = {
            meta: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
            linkedin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
            twitter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>`,
            youtube: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>`,
            tiktok: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>`,
            pinterest: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 15c0-2 1-4 4-5s4-2 4-4-1-3-4-3c-2 0-3.5 1.5-4 3"/><line x1="12" y1="10" x2="9" y2="21"/></svg>`,
            snapchat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a7 7 0 0 1 7 7c0 1-.2 2-.5 3 1 .3 2 .8 2 1.5 0 .5-.3 1-1 1.2.7.8 1 1.5 1 2.3 0 2-2.5 4-7.5 4s-7.5-2-7.5-4c0-.8.3-1.5 1-2.3-.7-.2-1-.7-1-1.2 0-.7 1-1.2 2-1.5-.3-1-.5-2-.5-3a7 7 0 0 1 7-7z"/></svg>`,
            threads: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8a4 4 0 0 1 4 4c0 2.5-2 4-4 4s-4-1.5-4-4c0-1 .5-2 1.5-2.5"/></svg>`
        };
        return icons[platform] || icons.meta;
    }

    // ==================== RENDER SAVED CAMPAIGNS ====================
    function renderSavedCampaigns() {
        const saved = loadSavedCampaigns();
        if (!saved.length) {
            return `<div class="smb-empty" style="padding: 20px;"><p>No saved campaigns yet. Generate and save ads to see them here.</p></div>`;
        }
        return saved.slice(0, 10).map(c => `
            <div class="smb-saved-item" data-campaign-id="${c.id}">
                <div class="smb-saved-item-header">
                    <span class="smb-saved-item-title">${c.brandName || 'Untitled'}</span>
                    <span class="smb-saved-item-meta">${new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="smb-saved-item-platform">${PLATFORM_SPECS[c.platform]?.name.split('(')[0].trim() || c.platform}</span>
                    <button type="button" class="smb-delete-campaign" data-id="${c.id}" title="Delete Campaign" style="background: transparent; border: 1px solid rgba(239, 68, 68, 0.5); color: #ef4444; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Attach handlers to saved campaign list items
    function attachSavedCampaignHandlers(container) {
        const savedList = container.querySelector('#smb-saved-list');
        if (!savedList) return;
        
        // Delete handlers
        savedList.querySelectorAll('.smb-delete-campaign').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const campaignId = btn.dataset.id;
                const saved = loadSavedCampaigns();
                const campaign = saved.find(c => c.id === campaignId);
                const campaignName = campaign?.brandName || 'this campaign';
                
                const confirmed = window.PersistenceUI
                    ? await window.PersistenceUI.confirm({
                        title: 'Delete Campaign?',
                        message: `Are you sure you want to delete "${campaignName}"? This action cannot be undone.`,
                        confirmText: 'Delete',
                        cancelText: 'Cancel'
                    })
                    : confirm(`Delete "${campaignName}"?`);
                
                if (confirmed) {
                    const updated = saved.filter(c => c.id !== campaignId);
                    localStorage.setItem('smb_saved_campaigns', JSON.stringify(updated));
                    savedList.innerHTML = renderSavedCampaigns();
                    attachSavedCampaignHandlers(container);
                    
                    if (window.PersistenceUI) {
                        window.PersistenceUI.showSuccess('Campaign Deleted', `"${campaignName}" has been removed`);
                    }
                }
            });
        });
    }

    // ==================== SAVE/LOAD CAMPAIGNS ====================
    function loadSavedCampaigns() {
        try {
            return JSON.parse(localStorage.getItem('smb_saved_campaigns') || '[]');
        } catch (e) {
            return [];
        }
    }

    function saveCampaign(campaign) {
        const saved = loadSavedCampaigns();
        saved.unshift(campaign);
        localStorage.setItem('smb_saved_campaigns', JSON.stringify(saved.slice(0, 50)));
    }

    // ==================== GENERATE ADS ====================
    async function generateAds(container) {
        const platform = PLATFORM_SPECS[builder.selectedPlatform];
        const adType = platform.adTypes[builder.selectedAdType];
        const framework = COPY_FRAMEWORKS[builder.selectedFramework];
        const funnel = FUNNEL_STAGES[builder.selectedFunnel];

        // Get form values
        const brandName = container.querySelector('#smb-brand-name')?.value || '';
        const industry = container.querySelector('#smb-industry')?.value || '';
        const product = container.querySelector('#smb-product')?.value || '';
        const audience = container.querySelector('#smb-audience')?.value || '';
        const benefits = container.querySelector('#smb-benefits')?.value || '';
        const offer = container.querySelector('#smb-offer')?.value || '';
        const url = container.querySelector('#smb-url')?.value || '';
        const tone = container.querySelector('#smb-tone')?.value || 'professional';
        const variations = parseInt(container.querySelector('#smb-variations')?.value || '3');

        if (!product) {
            alert('Please enter a product or service to promote');
            return;
        }

        const resultsDiv = container.querySelector('#smb-results');
        resultsDiv.innerHTML = `<div class="smb-loading"><div class="smb-spinner"></div>Generating ${platform.name} ads...</div>`;

        // Build the prompt
        const prompt = buildPrompt({
            platform, adType, framework, funnel,
            brandName, industry, product, audience, benefits, offer, url, tone, variations
        });

        try {
            const response = await callAI(prompt);
            const ads = parseAIResponse(response, adType, variations);
            
            builder.generatedAds = ads;
            renderResults(container, ads, adType, platform);
            
            // Show export actions
            container.querySelector('#smb-export-actions').style.display = 'flex';
            container.querySelector('#smb-refine-section').style.display = 'block';
            populateRefineCheckboxes(container, adType);
            
        } catch (error) {
            console.error('Generation error:', error);
            resultsDiv.innerHTML = `
                <div class="smb-policy-warning">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <p>Error generating ads: ${error.message}. Please check your API key in Settings.</p>
                </div>
            `;
        }
    }

    // ==================== BUILD PROMPT ====================
    function buildPrompt(data) {
        const { platform, adType, framework, funnel, brandName, industry, product, audience, benefits, offer, url, tone, variations } = data;
        
        // Build field requirements
        const fieldReqs = Object.entries(adType.fields).map(([key, field]) => {
            const limit = field.optimal || field.max;
            const count = field.count || 1;
            return `- ${field.label}: ${limit} characters max${count > 1 ? ` (generate ${count} variations)` : ''}`;
        }).join('\n');

        return `You are an expert social media advertising copywriter. Generate ${variations} high-converting ad variations for ${platform.name}.

=== AD TYPE: ${adType.name} ===
Character limits (MUST BE FOLLOWED EXACTLY):
${fieldReqs}

=== COPY FRAMEWORK: ${framework.name} ===
${framework.prompt}
Structure: ${framework.structure.join(' → ')}

=== FUNNEL STAGE: ${funnel.name} ===
Goal: ${funnel.goal}
Tone: ${funnel.tone}
Recommended CTAs: ${funnel.ctas.join(', ')}

=== BRAND DETAILS ===
Brand: ${brandName || 'Not specified'}
Industry: ${industry || 'General'}
Product/Service: ${product}
Target Audience: ${audience || 'General audience'}
Key Benefits: ${benefits || 'Not specified'}
Offer: ${offer || 'No specific offer'}
Landing Page: ${url || 'Not specified'}
Voice/Tone: ${tone}

=== PLATFORM POLICIES ===
${getPolicyNotes(platform)}

=== HEADLINE DIVERSITY ===
Include a mix of these headline types across variations:
1. Benefit-led: Focus on what the user gains
2. Question: Engage with pain points
3. Social proof: Numbers and credibility
4. How-to: Promise valuable knowledge
5. Urgency: Create time pressure
6. CTA-forward: Lead with action

=== OUTPUT FORMAT ===
Return ONLY valid JSON in this exact format:
{
  "ads": [
    {
      "variation": 1,
      ${Object.keys(adType.fields).map(key => `"${key}": "copy here"`).join(',\n      ')}
    }
  ]
}

Generate exactly ${variations} variations. Each field MUST be within its character limit.
Make each variation distinct - different angles, hooks, and approaches.
Front-load value in the first 100 characters.
Include the offer naturally if provided.
Do NOT use excessive punctuation, all caps, or banned claims.`;
    }

    // ==================== GET POLICY NOTES ====================
    function getPolicyNotes(platform) {
        const notes = [];
        if (platform.policies.superlatives === 'restricted') notes.push('- Avoid superlatives without proof (best, #1, etc.)');
        if (platform.policies.beforeAfter === 'restricted') notes.push('- Before/after images restricted');
        if (platform.policies.youLanguage === 'restricted') notes.push('- Avoid personal attributes targeting ("you" referring to characteristics)');
        if (platform.policies.excessiveCaps === 'restricted') notes.push('- No excessive capitalization');
        if (platform.policies.emojis === 'restricted') notes.push('- Avoid emojis in paid ads');
        return notes.length ? notes.join('\n') : 'Standard policies apply';
    }

    // ==================== CALL AI ====================
    // Selected model for generation
    let selectedModel = 'gemini-3-flash-preview';

    function setModel(modelId) {
        selectedModel = modelId;
        console.log(`[SocialMedia] Model set to: ${modelId}`);
    }

    async function callAI(prompt) {
        // Use AIModelSelector if available for multi-model support
        if (window.AIModelSelector) {
            const modelId = selectedModel || window.AIModelSelector.selectedModel || 'gemini-3-flash-preview';
            console.log(`[SocialMedia] Using AIModelSelector with model: ${modelId}`);
            try {
                const result = await window.AIModelSelector.callAI(prompt, { 
                    model: modelId,
                    temperature: 0.8,
                    maxTokens: 8192
                });
                return typeof result === 'string' ? result : JSON.stringify(result);
            } catch (error) {
                console.error('[SocialMedia] AIModelSelector call failed:', error);
                throw error;
            }
        }

        // Fallback: Try to get API key from settings using the proper settings manager
        let apiKey = '';
        let provider = 'gemini';

        // Method 1: Use CAVSettings manager (preferred)
        if (window.CAVSettings?.manager?.getAPIKey) {
            apiKey = window.CAVSettings.manager.getAPIKey('gemini');
            provider = 'gemini';
            
            if (!apiKey) {
                apiKey = window.CAVSettings.manager.getAPIKey('openai');
                provider = 'openai';
            }
            if (!apiKey) {
                apiKey = window.CAVSettings.manager.getAPIKey('claude');
                provider = 'claude';
            }
        }
        
        // Method 2: Use access control
        if (!apiKey && window.CAVSettings?.manager?.accessControl?.getAPIKey) {
            const result = window.CAVSettings.manager.accessControl.getAPIKey('gemini', window.CAVSettings.manager);
            if (result?.key) {
                apiKey = result.key;
                provider = 'gemini';
            }
        }
        
        // Method 3: Try cavSettings (alternative global)
        if (!apiKey && window.cavSettings?.apiAccess?.getApiKey) {
            apiKey = window.cavSettings.apiAccess.getApiKey('gemini');
            provider = 'gemini';
            if (!apiKey) {
                apiKey = window.cavSettings.apiAccess.getApiKey('openai');
                provider = 'openai';
            }
        }

        // Method 4: Fallback to localStorage direct read
        if (!apiKey) {
            try {
                // Get current user email from session
                const session = JSON.parse(localStorage.getItem('cav_session') || sessionStorage.getItem('cav_session') || '{}');
                const userEmail = session?.user?.email;
                
                if (userEmail) {
                    const userStorageKey = `cav_v3_settings_${userEmail.toLowerCase().replace(/[^a-z0-9]/gi, '_')}`;
                    const userSettings = JSON.parse(localStorage.getItem(userStorageKey) || '{}');
                    
                    if (userSettings.apiKeys?.gemini?.key) {
                        apiKey = userSettings.apiKeys.gemini.key;
                        provider = 'gemini';
                    } else if (userSettings.apiKeys?.openai?.key) {
                        apiKey = userSettings.apiKeys.openai.key;
                        provider = 'openai';
                    } else if (userSettings.apiKeys?.claude?.key) {
                        apiKey = userSettings.apiKeys.claude.key;
                        provider = 'claude';
                    }
                }
                
                // Try anonymous settings
                if (!apiKey) {
                    const anonSettings = JSON.parse(localStorage.getItem('cav_v3_settings') || '{}');
                    if (anonSettings.apiKeys?.gemini?.key) {
                        apiKey = anonSettings.apiKeys.gemini.key;
                        provider = 'gemini';
                    } else if (anonSettings.apiKeys?.openai?.key) {
                        apiKey = anonSettings.apiKeys.openai.key;
                        provider = 'openai';
                    }
                }
            } catch (e) {
                console.error('[SocialMedia] Error loading API keys:', e);
            }
        }

        if (!apiKey) {
            throw new Error('No API key found. Please configure an AI provider in Settings.');
        }
        
        console.log('[SocialMedia] Using', provider, 'API');

        if (provider === 'gemini') {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.8, maxOutputTokens: 8192 }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'API request failed');
            }

            const result = await response.json();
            return result.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } else if (provider === 'claude') {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 8192,
                    messages: [{ role: 'user', content: prompt }]
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'API request failed');
            }

            const result = await response.json();
            return result.content?.[0]?.text || '';
        } else {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.8,
                    max_tokens: 8192
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'API request failed');
            }

            const result = await response.json();
            return result.choices?.[0]?.message?.content || '';
        }
    }

    // ==================== PARSE AI RESPONSE ====================
    function parseAIResponse(response, adType, expectedCount) {
        try {
            // Extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*"ads"[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in response');
            }
            
            const data = JSON.parse(jsonMatch[0]);
            return data.ads || [];
        } catch (e) {
            console.error('Parse error:', e);
            // Try to extract manually
            return [];
        }
    }

    // ==================== RENDER RESULTS ====================
    function renderResults(container, ads, adType, platform) {
        const resultsDiv = container.querySelector('#smb-results');
        
        if (!ads.length) {
            resultsDiv.innerHTML = `
                <div class="smb-policy-warning">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <p>Could not parse ad variations. Please try again.</p>
                </div>
            `;
            return;
        }

        resultsDiv.innerHTML = ads.map((ad, idx) => `
            <div class="smb-result-card" data-ad-index="${idx}">
                <div class="smb-result-header">
                    <span class="smb-result-title">Variation ${idx + 1}</span>
                    <span class="smb-result-badge">${adType.name}</span>
                </div>
                ${Object.entries(adType.fields).map(([key, field]) => {
                    const value = ad[key] || '';
                    const charCount = value.length;
                    const limit = field.optimal || field.max;
                    const isOver = charCount > field.max;
                    const isWarning = charCount > limit && charCount <= field.max;
                    
                    return `
                        <div class="smb-field-group">
                            <div class="smb-field-label">
                                ${field.label}
                                <span class="smb-field-chars ${isOver ? 'error' : isWarning ? 'warning' : ''}">${charCount}/${field.max}</span>
                            </div>
                            <div class="smb-field-content" data-field="${key}">
                                ${escapeHtml(value)}
                                <button type="button" class="smb-copy-btn" data-copy="${escapeAttr(value)}">Copy</button>
                            </div>
                        </div>
                    `;
                }).join('')}
                ${checkPolicyViolations(ad, platform) ? `
                    <div class="smb-policy-warning">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        <p>${checkPolicyViolations(ad, platform)}</p>
                    </div>
                ` : ''}
            </div>
        `).join('');

        // Add copy button handlers
        resultsDiv.querySelectorAll('.smb-copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const text = btn.dataset.copy;
                navigator.clipboard.writeText(text);
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = 'Copy', 1500);
            });
        });
    }

    // ==================== CHECK POLICY VIOLATIONS ====================
    function checkPolicyViolations(ad, platform) {
        const warnings = [];
        const allText = Object.values(ad).join(' ').toLowerCase();
        
        // Check for excessive caps
        const capsRatio = (Object.values(ad).join('').match(/[A-Z]/g) || []).length / Object.values(ad).join('').length;
        if (capsRatio > 0.3 && platform.policies.excessiveCaps === 'restricted') {
            warnings.push('Excessive capitalization detected');
        }

        // Check for superlatives
        const superlatives = ['best', 'fastest', 'cheapest', '#1', 'number one', 'top rated'];
        if (superlatives.some(s => allText.includes(s)) && platform.policies.superlatives !== 'allowed') {
            warnings.push('Superlative claims may require proof');
        }

        // Check for emojis in platforms that restrict them
        const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(allText);
        if (hasEmoji && platform.policies.emojis === 'restricted') {
            warnings.push('Emojis not recommended for paid ads on this platform');
        }

        return warnings.length ? warnings.join('. ') : null;
    }

    // ==================== POPULATE REFINE CHECKBOXES ====================
    function populateRefineCheckboxes(container, adType) {
        const checkboxesDiv = container.querySelector('#smb-refine-checkboxes');
        checkboxesDiv.innerHTML = Object.entries(adType.fields).map(([key, field]) => `
            <label class="smb-refine-check" data-field="${key}">
                <input type="checkbox" name="refine-field" value="${key}">
                <span>${field.label}</span>
            </label>
        `).join('');

        checkboxesDiv.querySelectorAll('.smb-refine-check').forEach(label => {
            label.addEventListener('click', () => {
                label.classList.toggle('selected');
                label.querySelector('input').checked = label.classList.contains('selected');
            });
        });
    }

    // ==================== EXPORT CSV ====================
    function exportCSV(platform, adType) {
        const ads = builder.generatedAds;
        if (!ads.length) return;

        // Build CSV headers
        const headers = ['Variation', ...Object.values(adType.fields).map(f => f.label)];
        
        // Build rows
        const rows = ads.map((ad, idx) => {
            return [idx + 1, ...Object.keys(adType.fields).map(key => `"${(ad[key] || '').replace(/"/g, '""')}"`)]
        });

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${platform.name.split('(')[0].trim()}_${adType.name}_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ==================== UTILITY FUNCTIONS ====================
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function escapeAttr(str) {
        return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // ==================== ATTACH EVENT HANDLERS ====================
    function attachEventHandlers(container) {
        // Check for pre-filled data from Keyword Analyzer
        try {
            const kwaData = localStorage.getItem('kwa_ad_builder_data');
            const kwaPlatform = localStorage.getItem('kwa_social_platform');
            
            if (kwaData) {
                const data = JSON.parse(kwaData);
                console.log('[SocialMedia] Pre-filling from Keyword Analyzer:', data);
                
                setTimeout(() => {
                    // Pre-fill form fields
                    if (data.brandName) {
                        const brandInput = container.querySelector('#smb-brand-name');
                        if (brandInput) brandInput.value = data.brandName;
                    }
                    if (data.product) {
                        const productInput = container.querySelector('#smb-product');
                        if (productInput) productInput.value = data.product;
                    }
                    if (data.audience) {
                        const audienceInput = container.querySelector('#smb-audience');
                        if (audienceInput) audienceInput.value = data.audience;
                    }
                    if (data.benefits) {
                        const benefitsInput = container.querySelector('#smb-benefits');
                        if (benefitsInput) benefitsInput.value = data.benefits;
                    }
                    if (data.url) {
                        const urlInput = container.querySelector('#smb-url');
                        if (urlInput) urlInput.value = data.url;
                    }
                    if (data.industry) {
                        const industrySelect = container.querySelector('#smb-industry');
                        if (industrySelect) {
                            // Try to match industry
                            const options = industrySelect.querySelectorAll('option');
                            options.forEach(opt => {
                                if (opt.value.toLowerCase().includes(data.industry.toLowerCase()) ||
                                    opt.textContent.toLowerCase().includes(data.industry.toLowerCase())) {
                                    industrySelect.value = opt.value;
                                }
                            });
                        }
                    }
                    
                    // Pre-select platform if specified
                    if (kwaPlatform) {
                        const platformBtn = container.querySelector(`.smb-platform-btn[data-platform="${kwaPlatform}"]`);
                        if (platformBtn) platformBtn.click();
                    }
                }, 100);
                
                // Clear the data after using it
                localStorage.removeItem('kwa_ad_builder_data');
                localStorage.removeItem('kwa_social_platform');
            }
        } catch (e) {
            console.error('[SocialMedia] Error loading pre-fill data:', e);
        }

        // Platform selection
        container.querySelectorAll('.smb-platform-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                builder.selectedPlatform = btn.dataset.platform;
                const platform = PLATFORM_SPECS[builder.selectedPlatform];
                builder.selectedAdType = Object.keys(platform.adTypes)[0];
                
                // Update UI
                container.querySelectorAll('.smb-platform-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update ad type pills
                const pillsDiv = container.querySelector('#smb-adtype-pills');
                pillsDiv.innerHTML = Object.entries(platform.adTypes).map(([key, type]) => `
                    <button type="button" class="smb-adtype-pill ${builder.selectedAdType === key ? 'active' : ''}" data-adtype="${key}">${type.name}</button>
                `).join('');
                
                // Re-attach ad type handlers
                attachAdTypeHandlers(container);
                
                // Update generate button text
                container.querySelector('#smb-generate-btn').innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    Generate ${platform.name.split('(')[0].trim()} Ads
                `;
            });
        });

        // Ad type pills
        attachAdTypeHandlers(container);

        // Framework selection
        container.querySelectorAll('.smb-framework-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                builder.selectedFramework = btn.dataset.framework;
                container.querySelectorAll('.smb-framework-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Funnel selection
        container.querySelectorAll('.smb-funnel-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                builder.selectedFunnel = btn.dataset.funnel;
                container.querySelectorAll('.smb-funnel-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Power words
        container.querySelectorAll('.smb-power-word').forEach(word => {
            word.addEventListener('click', () => {
                const benefitsField = container.querySelector('#smb-benefits');
                if (benefitsField) {
                    benefitsField.value += (benefitsField.value ? '\n' : '') + word.dataset.word;
                }
            });
        });

        // Generate button
        // Initialize AI Model Selector
        if (window.AIModelSelector) {
            window.AIModelSelector.renderSelector('smb-model-selector', (modelId, model) => {
                console.log('[SocialMedia] Model changed to:', modelId);
                setModel(modelId);
            }, { showDescription: true, compact: false });
        }

        container.querySelector('#smb-generate-btn').addEventListener('click', () => {
            // Set the selected model before generating
            const modelSelect = container.querySelector('#smb-model-selector-select');
            if (modelSelect) {
                setModel(modelSelect.value);
            }
            generateAds(container);
        });

        // Copy all
        container.querySelector('#smb-copy-all')?.addEventListener('click', () => {
            const ads = builder.generatedAds;
            const platform = PLATFORM_SPECS[builder.selectedPlatform];
            const adType = platform.adTypes[builder.selectedAdType];
            
            const text = ads.map((ad, idx) => {
                return `=== VARIATION ${idx + 1} ===\n` +
                    Object.entries(adType.fields).map(([key, field]) => `${field.label}: ${ad[key] || ''}`).join('\n');
            }).join('\n\n');
            
            navigator.clipboard.writeText(text);
            alert('All ads copied to clipboard!');
        });

        // Export CSV
        container.querySelector('#smb-export-csv')?.addEventListener('click', () => {
            const platform = PLATFORM_SPECS[builder.selectedPlatform];
            const adType = platform.adTypes[builder.selectedAdType];
            exportCSV(platform, adType);
        });

        // Save to CRM - with enhanced feedback
        container.querySelector('#smb-save-campaign')?.addEventListener('click', async function() {
            const saveBtn = this;
            const brandName = container.querySelector('#smb-brand-name')?.value || 'Untitled Campaign';
            
            if (!builder.generatedAds || !builder.generatedAds.length) {
                if (window.PersistenceUI) {
                    window.PersistenceUI.showError('Nothing to Save', 'Generate ad copy first, then save');
                } else {
                    alert('No ads to save. Generate ads first.');
                }
                return;
            }
            
            const originalHTML = saveBtn.innerHTML;
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="persist-spinner" style="animation:spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/></svg> Saving...';
            
            try {
                const campaign = {
                    id: Date.now().toString(),
                    brandName,
                    platform: builder.selectedPlatform,
                    adType: builder.selectedAdType,
                    framework: builder.selectedFramework,
                    funnel: builder.selectedFunnel,
                    ads: builder.generatedAds,
                    createdAt: new Date().toISOString()
                };
                
                saveCampaign(campaign);
                
                // Also save to UnifiedStorage for cross-device sync
                if (window.UnifiedStorage) {
                    await window.UnifiedStorage.saveSocialMediaBuild({
                        ...campaign,
                        user_email: window.UnifiedStorage?.getCurrentUserEmail?.() || window.cavUserSession?.email || 'anonymous'
                    });
                }
                
                // Sync to CRM if available
                if (window.CAV_CRM) {
                    window.CAV_CRM.logActivity('campaign_created', {
                        title: brandName,
                        platform: builder.selectedPlatform,
                        adType: builder.selectedAdType,
                        variationCount: builder.generatedAds.length
                    });
                }
                
                // Update saved list
                container.querySelector('#smb-saved-list').innerHTML = renderSavedCampaigns();
                attachSavedCampaignHandlers(container);
                
                if (window.PersistenceUI) {
                    window.PersistenceUI.showSuccess('Campaign Saved', `"${brandName}" has been saved to your library`);
                }
                
                saveBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#10b981;"><polyline points="20 6 9 17 4 12"/></svg> Saved!';
                
                setTimeout(() => {
                    saveBtn.innerHTML = originalHTML;
                    saveBtn.disabled = false;
                }, 2000);
                
            } catch (error) {
                console.error('[SocialMedia] Save error:', error);
                saveBtn.innerHTML = originalHTML;
                saveBtn.disabled = false;
                
                if (window.PersistenceUI) {
                    window.PersistenceUI.showError('Save Failed', error.message || 'Could not save campaign');
                }
            }
        });
        
        // Attach handlers to saved campaigns
        attachSavedCampaignHandlers(container);

        // Refine button
        container.querySelector('#smb-refine-btn')?.addEventListener('click', () => refineAds(container));
    }

    function attachAdTypeHandlers(container) {
        container.querySelectorAll('.smb-adtype-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                builder.selectedAdType = pill.dataset.adtype;
                container.querySelectorAll('.smb-adtype-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
            });
        });
    }

    // ==================== REFINE ADS ====================
    async function refineAds(container) {
        const selectedFields = Array.from(container.querySelectorAll('.smb-refine-check.selected')).map(c => c.dataset.field);
        const refineContext = container.querySelector('#smb-refine-input')?.value || '';
        
        if (!selectedFields.length) {
            alert('Please select at least one field to refine');
            return;
        }

        const platform = PLATFORM_SPECS[builder.selectedPlatform];
        const adType = platform.adTypes[builder.selectedAdType];

        const prompt = `Refine the following ad copy fields: ${selectedFields.join(', ')}

Current ads:
${JSON.stringify(builder.generatedAds, null, 2)}

Refinement instructions: ${refineContext || 'Improve clarity, impact, and conversion potential'}

Platform: ${platform.name}
Ad Type: ${adType.name}

Return the same JSON format with improved copy for the selected fields only. Keep other fields unchanged.
IMPORTANT: Stay within character limits:
${selectedFields.map(f => `- ${adType.fields[f].label}: ${adType.fields[f].max} chars max`).join('\n')}

Return ONLY valid JSON.`;

        const resultsDiv = container.querySelector('#smb-results');
        const originalHTML = resultsDiv.innerHTML;
        resultsDiv.innerHTML = `<div class="smb-loading"><div class="smb-spinner"></div>Refining ads...</div>`;

        try {
            const response = await callAI(prompt);
            const refinedAds = parseAIResponse(response, adType, builder.generatedAds.length);
            
            if (refinedAds.length) {
                builder.generatedAds = refinedAds;
                renderResults(container, refinedAds, adType, platform);
            } else {
                resultsDiv.innerHTML = originalHTML;
                alert('Could not parse refined ads. Please try again.');
            }
        } catch (error) {
            resultsDiv.innerHTML = originalHTML;
            alert('Error refining ads: ' + error.message);
        }
    }

    // ==================== PUBLIC API ====================
    return {
        builder,
        createUI,
        attachEventHandlers,
        PLATFORM_SPECS,
        COPY_FRAMEWORKS,
        FUNNEL_STAGES,
        POWER_WORDS
    };
})();
