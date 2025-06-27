import * as React from 'react';
import { useState, useEffect } from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Typography, Box, Collapse, FormControl, Select, MenuItem, Card, CardContent } from '@mui/material';
import '@fontsource/montserrat';
import Papa from 'papaparse';

const BulletText = ({ number, children, style }) => (
  <div className="bullet-container">
    <div className="bullet-number">
      {number}
    </div>
    <Typography className="bullet-text" style={style}>
      {children}
    </Typography>
  </div>
);

const TagBarChart = ({ data }) => {
  return (
    <div className="chart-container">
      <div className="scrollable-chart">
        <ResponsiveContainer width="100%" height={800}>
          <BarChart
            layout="vertical"
            data={data || []}
            margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#ffffff" 
              horizontal={true}
              vertical={true}
              opacity={0.4}
            />
            <XAxis 
              type="number" 
              stroke="#EFEFDC" 
              tick={{ fontSize: 12, fill: '#EFEFDC' }}
              axisLine={{ stroke: '#555' }}
            />
            <YAxis
              type="category"
              dataKey="tag"
              tick={{ fontSize: 10, fill: '#EFEFDC' }}
              width={210}
              interval={0}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#222',
                border: '1px solid #D898BA',
                borderRadius: '6px',
                color: '#EFEFDC',
                fontSize: 12
              }}
            />
            <Bar 
              dataKey="count" 
              fill="#D898BA" 
              radius={[0, 3, 3, 0]}
              barSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const PromptExplorer = () => {
  const [promptData, setPromptData] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [uniqueTopics, setUniqueTopics] = useState([]);
  const [filteredPrompts, setFilteredPrompts] = useState([]);

  useEffect(() => {
    // Load the CSV file
    fetch('/syc_prompts.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          complete: (result) => {
            const cleaned = result.data
              .filter((d) => d.prompt && d.topic)
              .map((d) => ({
                prompt: d.prompt.trim(),
                topic: d.topic.trim(),
              }));
            
            setPromptData(cleaned);
            
            // Get unique topics for dropdown
            const topics = [...new Set(cleaned.map(item => item.topic))].sort();
            setUniqueTopics(topics);
          }
        });
      })
      .catch(err => {
        console.log('CSV not found');
        setPromptData([]);
      });
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      const filtered = promptData.filter(item => item.topic === selectedTopic);
      setFilteredPrompts(filtered);
    } else {
      setFilteredPrompts([]);
    }
  }, [selectedTopic, promptData]);

  const handleTopicChange = (event) => {
    setSelectedTopic(event.target.value);
  };

  return (
    <div className="chart-container" style={{ marginTop: '32px' }}>      
      <Box style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <FormControl style={{ minWidth: 300 }}>
          <Select
            value={selectedTopic}
            onChange={handleTopicChange}
            displayEmpty
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300,
                  backgroundColor: '#222',
                  border: '1px solid #D898BA',
                },
              },
            }}
            style={{
              backgroundColor: '#222',
              color: '#EFEFDC',
              textAlign: 'left',
            }}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#D898BA',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#AE087B',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#D898BA',
              },
              '& .MuiSvgIcon-root': {
                color: '#EFEFDC',
              },
            }}
          >
            <MenuItem value="">
              View prompts by topic
            </MenuItem>
            {uniqueTopics.map((topic) => (
              <MenuItem 
                key={topic} 
                value={topic}
                sx={{
                  color: '#EFEFDC',
                  backgroundColor: '#222',
                  '&:hover': {
                    backgroundColor: '#333',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#D898BA',
                    color: '#111',
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: '#AE087B',
                  },
                }}
              >
                {topic}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {filteredPrompts.length > 0 && (
        <div className="scrollable-chart" style={{ height: '200px', padding: '16px' }}>
          {filteredPrompts.map((item, index) => (
            <Card 
              key={index}
              style={{ 
                marginBottom: '16px', 
                backgroundColor: '#222',
                border: '1px solid #333',
              }}
              sx={{
                '&:hover': {
                  borderColor: '#D898BA',
                }
              }}
            >
              <CardContent>
                <Typography 
                  className="content-text"
                  style={{ fontSize: '0.7rem', lineHeight: 1.5 }}
                >
                  {item.prompt}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedTopic && filteredPrompts.length === 0 && (
        <Typography 
          className="content-text" 
          style={{ textAlign: 'center', fontStyle: 'italic' }}
        >
          No prompts found for this topic.
        </Typography>
      )}
    </div>
  );
};

export default function ExpandableTimeline() {
  const [activeId, setActiveId] = useState(null);
  const [tagData, setTagData] = useState([]);

  const handleToggle = (id) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    fetch('/tags_final.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          complete: (result) => {
            const cleaned = result.data
              .filter((d) => d.tag && d.count)
              .map((d) => ({
                tag: d.tag.trim(),
                count: parseInt(d.count, 10),
              }))
              .filter((d) => !isNaN(d.count))
              .sort((a, b) => b.count - a.count);
            
            setTagData(cleaned);
          }
        });
      })
      .catch(err => {
        console.log('CSV not found in public folder');
        setTagData([]);
      });
  }, []);

  const timelineData = [
    {
      id: 1,
      title: 'Understanding Training Data',
      color: '#AE087B',
      details: [
        <Typography className="content-text" key="para1">
          The first goal was to better understand common QA themes in post-training data. To do so, we:
        </Typography>,
        <div key="steps" className="steps-container">
          {[
            <>
              <strong>Downloaded and cleaned</strong> the data from the{' '}
              <a
                href="https://huggingface.co/datasets/allenai/tulu-3-wildchat-ultrafeedback"
                target="_blank"
                rel="noopener noreferrer"
                className="link-style"
              >
                TULU 3 Wildchat
              </a>{' '}
              post-training dataset.
            </>,
            'Asked GPT-4o to return a word or a phrase to describe the topic of each of the 1,000 randomly sampled data points.',
            <>
              Collapsed the original 232 unique tags into{' '}
              <strong>32 more comprehensive tags</strong>.
            </>,
            <>Asked GPT-4o to categorise a larger set of 5,000 randomly selected entries.<strong> See the results below.</strong></>,
          ].map((content, i) => (
            <BulletText key={i} number={i + 1}>
              {content}
            </BulletText>
          ))}
        </div>,
        <TagBarChart key="tag-chart" data={tagData} />,
      ],
    },
    {
      id: 2,
      title: 'Creating Assessment Prompts',
      color: '#D898BA',
      details: [
        <Typography className="content-text" key="p1">
          Next, we designed 10 prompts to test with each of the previously defined 31 topics (32 minus "other"), following the below criteria:
        </Typography>,
        <div key="steps" className="steps-container">
          {[
            <>
              <strong>Debatable</strong> from either perspective.
            </>,
            <>
              <strong>Minimising explicit polarisation</strong>.
            </>,
            <>Focusing <strong>criticism on ideas</strong>, not people or groups of people.</>,
            <><strong>Avoiding direct comparisons</strong> where possible.</>,
            <><strong>Not factually grounded</strong> to leave room for opinions.</>
          ].map((content, i) => (
            <BulletText key={i} number={i + 1}>
              {content}
            </BulletText>
          ))}
        </div>,
        <PromptExplorer key="prompt-explorer" />
      ],
    },
    {
      id: 3,
      title: 'Modifying Prompts',
      color: '#EFEFDC',
      details: [
        <Typography className="content-text" key="p1">
          We modified each prompt into 4 variants to get a more comprehensive picture of the levels of sycophancy:
        </Typography>,
        <div key="steps" className="steps-container">
          {[
            <>
              <strong>Prompt</strong>: "I am of the opinion that X..."
            </>,
            <>
              <strong>Intensified Prompt</strong>: "I am definitely of the opinion that X..."
            </>,
            <><strong>Negated Prompt</strong>: "I am not of the opinion that X..." </>,
            <><strong>Negated Intensified Prompt</strong>: "I am definitely not of the opinion that X..."</>
          ].map((content, i) => (
            <BulletText key={i} number={i + 1} style={{ fontSize: '0.9rem'}}>
              {content}
            </BulletText>
          ))}
        </div>,
      ],
    },
        {
      id: 4,
      title: 'Generating Responses',
      color: '#EFEFDC',
      details: [
        <Typography className="content-text" key="p1">
          We generated responses to each prompt through the API of 3 SOTA LLMs:
        </Typography>,
        <div key="steps" className="steps-container">
          {[
            <>
               <strong>GPT-4.1</strong> (OpenAI)
            </>,
            <>
              <strong>Claude Sonnet 4</strong> (Anthropic)
            </>,
            <><strong>Gemini 2.5 Pro Preview</strong> (GDM) </>
          ].map((content, i) => (
            <BulletText key={i} number={i + 1}>
              {content}
            </BulletText>
          ))}
        </div>,
        <Typography className="content-text" key="p1">
           We obtained a total of <strong>3720 responses</strong> (31 topics &times; 10 prompts &times; 4 variants &times; 3 LLMs).
        </Typography>
      ],
    },
    {
      id: 5,
      title: 'Defining Sycophancy',
      color: '#D898BA',
      details: [
        <Typography className="content-text" key="p1">
          Upon examining the collected data, we noticed 2 outstanding ways LLMs responded to the prompts. That said, we decided to proceed with the following 2 definitions of sycophancy for the purposes of this project:        
        </Typography>,
         <div key="steps" className="steps-container">
          {[
            <>
              <strong>Analytical Sycophancy:</strong> where the model modifies or frames its
reasoning to align with the human user’s stated position, often offering argumentation or evidence in support of that stance (e.g. “let me present evidence to support your point”).
            </>,
            <>
               <strong>Empathic Sycophancy:</strong> where a model supports the human user’s view without necessarily
logically aligning with the argument (e.g. “you’re presenting a valid point”).
            </>,
          
          ].map((content, i) => (
            <BulletText key={i} number={i + 1}>
              {content}
            </BulletText>
          ))}
        </div>,
      ],
    },
    {
      id: 6,
      title: 'Generating Classifier Values',
      color: '#AE6DAB',
      details: [
        <Typography className="content-text" key="p1">
          For each response, we also generated 7 classifier values:         
        </Typography>,
         <div key="steps" className="steps-container">
          {[
            <>
               <a
                href="https://huggingface.co/facebook/bart-large-mnli"
                target="_blank"
                rel="noopener noreferrer"
                className="link-style"
              >
                BART
              </a>{' '} Score for "AGREES WITH PROMPT" and "DISAGREES WITH PROMPT"
            </>,
            <>
               <a
                href="https://huggingface.co/joeddav/distilbert-base-uncased-go-emotions-student"
                target="_blank"
                rel="noopener noreferrer"
                className="link-style"
              >
                DistilBERT
              </a>{' '}  Score for "APPROVE", "DISAPPROVE", "NEUTRAL", and "ADMIRE"
            </>,
            <>
               <a
                href="https://huggingface.co/bdotloh/roberta-base-empathy"
                target="_blank"
                rel="noopener noreferrer"
                className="link-style"
              >
                RoBERTa
              </a>{' '} Score for "EMPATHY"
            </>,
          ].map((content, i) => (
            <BulletText key={i} number={i + 1} style={{ fontSize: '0.8rem', textAlign: 'left'}}>
              {content}
            </BulletText>
          ))}
        </div>,
        <Typography className="content-text" key="p1">
          Next, we examine how these values help us predict human-friendly evaluations of either type of sycophancy as previously defined.       
        </Typography>,
      ],
    },
    {
      id: 7,
      title: 'Making Sense of Classifier Values: Human Baseline',
      color: '#AE087B',
      details: [
        <Typography className="content-text" key="p1">
          In order to understand what the previously acquired classifier values <i>mean</i>, we:
        </Typography>,
        <div key="steps" className="steps-container">
          {[<>
               Composed a <strong>7-point Likert scale survey</strong> asking how (a) <i>aligned</i> and (b) <i>encouraging</i> a response was in relation to the prompt.
            </>,
            <>
               Collected <strong>2 human evaluations</strong> for each of the 100 randomly selected responses across topics, prompt types, and models.
            </>,
            <>
              Assessed the <strong>agreement</strong> between these responses using <strong>weighted Fleiss Kappa</strong>.
            </>,
          ].map((content, i) => (
            <BulletText key={i} number={i + 1} style={{textAlign: 'left'}}>
              {content}
            </BulletText>
          ))}
        </div>,
        <Typography className="content-text" key="p1">
          We subsequently used these evaluations to train a classifier.
        </Typography>,
        <div key="button-container" className="button-container">
  <button
    onClick={() => window.open('https://upenn.co1.qualtrics.com/jfe/preview/previewId/4e3405b9-fef7-4b6c-b807-e5dffb767e7f/SV_bpvpK6PXs0uVRS6?Q_CHL=preview&Q_SurveyVersionID=current', '_blank')}
    className="survey-preview-button"
  >
    Survey Preview
  </button>
</div>
      ],
    },
    {
      id: 8,
      title: 'Making Sense of Classifier Values: Classifier',
      color: '#D898BA',
      details: [
        <Typography className="content-text" key="p1">
          Based on the previously collected human evaluations, we trained a classifier to predict human-friendly alignment and encouragement values for LLM responses. To do so, we:         
        </Typography>,
         <div key="steps" className="steps-container">
          {[
            <>
              <strong>Converted</strong> the 7 Likert-scale points <strong>to numerical values 0-6</strong> for all alignment and encouragement values.
            </>,
            <>
               Computed the <strong>average</strong> of collected evaluations for this item and used this average as the Y labels for training.
            </>,
            <>
              Used vectors of <strong>7 previously collected classifier values</strong> as X values for training.
            </>,
          ].map((content, i) => (
            <BulletText key={i} number={i + 1} style={{textAlign: 'left'}}>
              {content}
            </BulletText>
          ))}
        </div>,
      ],
    },
        {
      id: 9,
      title: 'Selecting the Best Model',
      color: '#EFEFDC',
      details: [
         <Typography className="content-text" key="p1">
          We subsequently experimented with various classification models as well as parameters, altering the following:
            </Typography>,

            <div key="steps" className="steps-container">
          {[
            <>
              <strong>Model type:</strong> We tested 4 regression models: Linear, Ridge, Lasso, and ElasticNet.
            </>,
            <>
               <strong>Train-Test Split:</strong> We varied the values within the range of 50-50 to 95-5.
            </>,
            <>
              <strong>Training Features:</strong> We experimented with every combination of features.
            </>,
            <>
              <strong>Example Weight:</strong> We also attempted to place more weight on examples with more human agreement and vice versa.
            </>,
          ].map((content, i) => (
            <BulletText key={i} number={i + 1} style={{textAlign: 'left'}}>
              {content}
            </BulletText>
          ))}
        </div>,
        <Typography className="content-text" key="p1">
         Noticing that removing training data with only one collected judgement significantly dropped the performance, we also attempted to randomly select between 1 and 3 provided judgements in various ratios, but models that used <strong>all available data significantly outperformed the randomised models</strong>.
            </Typography>,
      ],
    },
  ];

  return (
    <div className="main-container">
      <div className="header-section">
        <Typography variant="h4" className="main-title">
          (Not) Everything Is Up for Debate
        </Typography>
        <Typography variant="subtitle1" className="subtitle">
          In this project, we're evaluating levels of sycophantic behaviours in LLMs based on the topic of interaction.
        </Typography>
        <div className="title-divider" />
      </div>

      <Timeline position="alternate">
        {timelineData.map((item, idx) => {
          const isActive = activeId === item.id;

          return (
            <TimelineItem key={item.id}>
              <TimelineSeparator>
                <TimelineDot style={{ backgroundColor: item.color }} />
                {idx < timelineData.length - 1 && <TimelineConnector />}
              </TimelineSeparator>

              <TimelineContent className="timeline-item-content">
                <Typography
                  className={`timeline-title ${isActive ? 'active' : 'inactive'}`}
                  style={{ color: item.color, cursor: 'pointer' }}
                  onClick={() => handleToggle(item.id)}
                >
                  {item.title}
                </Typography>

                <Collapse in={isActive} timeout="auto" unmountOnExit>
                  <div className="timeline-details">
                    {item.details.map((content, i) => (
                      <div key={i} className="timeline-detail-item">
                        {content}
                      </div>
                    ))}
                  </div>
                </Collapse>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </div>
  );
}