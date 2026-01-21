'use client'

import {useState} from 'react'
import {
  Mail,
  Layout,
  MessageSquare,
  Copy,
  Download,
  Check,
  ChevronDown,
  ChevronUp,
  Twitter,
  Linkedin,
  Instagram,
} from 'lucide-react'
import {Button} from '@/components/ui/button'
import type {
  EmailTemplate,
  LandingPage,
  SocialPosts,
} from '@/daedalus/extract/brand/asset-generation'

interface AssetPreviewProps {
  email?: EmailTemplate
  landing?: LandingPage
  social?: SocialPosts
  brandSummary: {
    primaryColor: string
    fontFamily: string
    tone: string
  }
}

function CopyButton({text, label}: {text: string; label: string}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={handleCopy}
      className='border-zinc-700 text-zinc-400 hover:text-zinc-100'
    >
      {copied ? (
        <>
          <Check className='w-3 h-3 mr-1' />
          Copied
        </>
      ) : (
        <>
          <Copy className='w-3 h-3 mr-1' />
          {label}
        </>
      )}
    </Button>
  )
}

function DownloadButton({
  content,
  filename,
  label,
}: {
  content: string
  filename: string
  label: string
}) {
  const handleDownload = () => {
    const blob = new Blob([content], {type: 'text/html'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={handleDownload}
      className='border-zinc-700 text-zinc-400 hover:text-zinc-100'
    >
      <Download className='w-3 h-3 mr-1' />
      {label}
    </Button>
  )
}

function EmailPreview({email}: {email: EmailTemplate}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className='border border-zinc-800 bg-zinc-900/50 rounded'>
      <div className='p-4 border-b border-zinc-800'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Mail className='w-5 h-5 text-orange-500' />
            <h3 className='font-medium text-zinc-100'>Email Template</h3>
          </div>
          <div className='flex items-center gap-2'>
            <CopyButton text={email.html} label='Copy HTML' />
            <DownloadButton content={email.html} filename='email-template.html' label='Download' />
          </div>
        </div>
      </div>

      <div className='p-4 space-y-3'>
        <div>
          <p className='text-xs text-zinc-500 mb-1'>SUBJECT LINE</p>
          <p className='text-sm text-zinc-200 font-medium'>{email.subject}</p>
        </div>
        <div>
          <p className='text-xs text-zinc-500 mb-1'>PREHEADER</p>
          <p className='text-sm text-zinc-400'>{email.preheader}</p>
        </div>
        <div>
          <p className='text-xs text-zinc-500 mb-1'>HEADLINE</p>
          <p className='text-sm text-zinc-200'>{email.headline}</p>
        </div>
        <div>
          <p className='text-xs text-zinc-500 mb-1'>CTA</p>
          <p className='text-sm text-orange-500'>{email.cta_text}</p>
        </div>
      </div>

      <div className='border-t border-zinc-800'>
        <button
          onClick={() => setExpanded(!expanded)}
          className='w-full p-3 flex items-center justify-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors'
        >
          {expanded ? (
            <>
              <ChevronUp className='w-4 h-4' />
              Hide Preview
            </>
          ) : (
            <>
              <ChevronDown className='w-4 h-4' />
              Show Preview
            </>
          )}
        </button>
        {expanded && (
          <div className='p-4 border-t border-zinc-800 bg-white'>
            <div
              className='prose prose-sm max-w-none'
              dangerouslySetInnerHTML={{__html: email.html}}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function LandingPreview({landing}: {landing: LandingPage}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className='border border-zinc-800 bg-zinc-900/50 rounded'>
      <div className='p-4 border-b border-zinc-800'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Layout className='w-5 h-5 text-orange-500' />
            <h3 className='font-medium text-zinc-100'>Landing Page</h3>
          </div>
          <div className='flex items-center gap-2'>
            <CopyButton text={landing.markdown} label='Copy Markdown' />
            <DownloadButton content={landing.html} filename='landing-page.html' label='Download HTML' />
          </div>
        </div>
      </div>

      <div className='p-4 space-y-4'>
        <div>
          <p className='text-xs text-zinc-500 mb-1'>HEADLINE</p>
          <p className='text-lg text-zinc-100 font-bold'>{landing.headline}</p>
        </div>
        <div>
          <p className='text-xs text-zinc-500 mb-1'>SUBHEADLINE</p>
          <p className='text-sm text-zinc-300'>{landing.subheadline}</p>
        </div>
        <div>
          <p className='text-xs text-zinc-500 mb-2'>VALUE PROPOSITIONS</p>
          <div className='space-y-2'>
            {landing.value_props.map((prop, i) => (
              <div key={i} className='p-3 bg-zinc-800/50 border border-zinc-700 rounded'>
                <p className='text-sm text-zinc-200 font-medium'>{prop.title}</p>
                <p className='text-xs text-zinc-400 mt-1'>{prop.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className='text-xs text-zinc-500 mb-1'>PRIMARY CTA</p>
          <p className='text-sm text-orange-500 font-medium'>{landing.cta_primary.text}</p>
        </div>
      </div>

      <div className='border-t border-zinc-800'>
        <button
          onClick={() => setExpanded(!expanded)}
          className='w-full p-3 flex items-center justify-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors'
        >
          {expanded ? (
            <>
              <ChevronUp className='w-4 h-4' />
              Hide Preview
            </>
          ) : (
            <>
              <ChevronDown className='w-4 h-4' />
              Show Preview
            </>
          )}
        </button>
        {expanded && (
          <div className='p-4 border-t border-zinc-800 bg-white'>
            <div
              className='prose prose-sm max-w-none'
              dangerouslySetInnerHTML={{__html: landing.html}}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function SocialPreview({social}: {social: SocialPosts}) {
  const [activeTab, setActiveTab] = useState<'twitter' | 'linkedin' | 'instagram'>('twitter')

  const allPostsText = [
    '--- Twitter/X ---',
    ...social.twitter.map((p, i) => `${i + 1}. ${p.content}\n   #${p.hashtags.join(' #')}`),
    '',
    '--- LinkedIn ---',
    ...social.linkedin.map((p, i) => `${i + 1}. ${p.content}\n   #${p.hashtags.join(' #')}`),
    '',
    '--- Instagram ---',
    ...social.instagram.map((p, i) => `${i + 1}. ${p.caption}\n   #${p.hashtags.join(' #')}\n   Image idea: ${p.image_prompt}`),
  ].join('\n\n')

  return (
    <div className='border border-zinc-800 bg-zinc-900/50 rounded'>
      <div className='p-4 border-b border-zinc-800'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <MessageSquare className='w-5 h-5 text-orange-500' />
            <h3 className='font-medium text-zinc-100'>Social Media Posts</h3>
          </div>
          <CopyButton text={allPostsText} label='Copy All' />
        </div>
      </div>

      {/* Platform tabs */}
      <div className='flex border-b border-zinc-800'>
        <button
          onClick={() => setActiveTab('twitter')}
          className={`flex-1 p-3 flex items-center justify-center gap-2 text-sm transition-colors ${
            activeTab === 'twitter'
              ? 'text-orange-500 border-b-2 border-orange-500'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Twitter className='w-4 h-4' />
          X/Twitter ({social.twitter.length})
        </button>
        <button
          onClick={() => setActiveTab('linkedin')}
          className={`flex-1 p-3 flex items-center justify-center gap-2 text-sm transition-colors ${
            activeTab === 'linkedin'
              ? 'text-orange-500 border-b-2 border-orange-500'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Linkedin className='w-4 h-4' />
          LinkedIn ({social.linkedin.length})
        </button>
        <button
          onClick={() => setActiveTab('instagram')}
          className={`flex-1 p-3 flex items-center justify-center gap-2 text-sm transition-colors ${
            activeTab === 'instagram'
              ? 'text-orange-500 border-b-2 border-orange-500'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Instagram className='w-4 h-4' />
          Instagram ({social.instagram.length})
        </button>
      </div>

      <div className='p-4 space-y-3'>
        {activeTab === 'twitter' &&
          social.twitter.map((post, i) => (
            <div
              key={i}
              className='p-3 bg-zinc-800/50 border border-zinc-700 rounded space-y-2'
            >
              <div className='flex items-start justify-between'>
                <span className='text-[10px] px-2 py-0.5 bg-zinc-700 text-zinc-400 rounded'>
                  {post.type}
                </span>
                <span className='text-[10px] text-zinc-500'>{post.content.length}/280</span>
              </div>
              <p className='text-sm text-zinc-200'>{post.content}</p>
              <div className='flex flex-wrap gap-1'>
                {post.hashtags.map((tag, j) => (
                  <span key={j} className='text-xs text-orange-500/80'>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}

        {activeTab === 'linkedin' &&
          social.linkedin.map((post, i) => (
            <div
              key={i}
              className='p-3 bg-zinc-800/50 border border-zinc-700 rounded space-y-2'
            >
              <span className='text-[10px] px-2 py-0.5 bg-zinc-700 text-zinc-400 rounded'>
                {post.type}
              </span>
              <p className='text-sm text-zinc-200 whitespace-pre-wrap'>{post.content}</p>
              <div className='flex flex-wrap gap-1'>
                {post.hashtags.map((tag, j) => (
                  <span key={j} className='text-xs text-orange-500/80'>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}

        {activeTab === 'instagram' &&
          social.instagram.map((post, i) => (
            <div
              key={i}
              className='p-3 bg-zinc-800/50 border border-zinc-700 rounded space-y-2'
            >
              <span className='text-[10px] px-2 py-0.5 bg-zinc-700 text-zinc-400 rounded'>
                {post.type}
              </span>
              <p className='text-sm text-zinc-200'>{post.caption}</p>
              <div className='p-2 bg-zinc-900/50 border border-zinc-600 rounded'>
                <p className='text-[10px] text-zinc-500 mb-1'>IMAGE PROMPT</p>
                <p className='text-xs text-zinc-400 italic'>{post.image_prompt}</p>
              </div>
              <div className='flex flex-wrap gap-1'>
                {post.hashtags.map((tag, j) => (
                  <span key={j} className='text-xs text-orange-500/80'>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export function AssetPreview({email, landing, social, brandSummary}: AssetPreviewProps) {
  return (
    <div className='space-y-6'>
      {/* Brand Summary */}
      <div className='flex items-center gap-4 p-3 bg-zinc-800/30 border border-zinc-700 rounded'>
        <div className='flex items-center gap-2'>
          <div
            className='w-4 h-4 rounded'
            style={{backgroundColor: brandSummary.primaryColor}}
          />
          <span className='text-xs text-zinc-500'>Primary Color</span>
        </div>
        <div className='text-xs text-zinc-400'>|</div>
        <div className='text-xs text-zinc-400'>
          <span className='text-zinc-500'>Font:</span> {brandSummary.fontFamily}
        </div>
        <div className='text-xs text-zinc-400'>|</div>
        <div className='text-xs text-zinc-400'>
          <span className='text-zinc-500'>Tone:</span> {brandSummary.tone}
        </div>
      </div>

      {/* Asset Previews */}
      {email && <EmailPreview email={email} />}
      {landing && <LandingPreview landing={landing} />}
      {social && <SocialPreview social={social} />}
    </div>
  )
}
