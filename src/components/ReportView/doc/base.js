const { default: ReportView } = _ReportView;
const { Space } = antd;
const BaseExample = () => {
  return (
    <div className="outer">
      <Space direction="vertical" size={24}>
        <ReportView title="报告概述">
          <ReportView.List
            report={{
              list: [
                {
                  label: '目的',
                  content: '本报告旨在评估招聘顾问使用AI工具进行候选人初次沟通的能力，特别是在理解候选人需求、传达职位信息以及建立初步信任关系的效果。'
                },
                {
                  label: '测评对象',
                  content: '姓名：张伟'
                },
                {
                  label: '测评工具',
                  content: `AI模拟系统：提供基于语音和文本的交互模拟环境。\n评分标准：沟通技巧、信息传达清晰度、候选人反馈、建立关系的能力。`
                },
                {
                  label: '任务目标',
                  content: (
                    <ul>
                      <li>完整呈现初次沟通话术，展现每个关键动作和沟通顺序。</li>
                      <li>收集候选人信息：了解候选人工作背景，技术能力及其薪资要求。</li>
                      <li>挖掘需求：全面了解候选人求职动态和需求，从而掌握候选人存在的顾虑及。</li>
                      <li>有效推荐：根据候选人求职需求链接职位优势，强化技术吸引点，妥善处理候选人疑虑。</li>
                      <li>建立信任关系：使用沟通技巧，态度诚恳，和候选人站在一起，而非“博弈”关系。</li>
                    </ul>
                  )
                }
              ]
            }}
          />
        </ReportView>
        <ReportView title="测评结果">
          <ReportView.Result
            report={{
              total: {
                score: '81.8',
                label: '综合得分'
              },
              list: [
                {
                  label: '沟通程序指引及话术',
                  score: '86',
                  content:
                    '张伟在这一部分的表现总体上是专业且有条理的，能够按照一定的流程顺利开展对话。他表现出的礼貌和专业性在询问是否方便通话时得到了完美的体现，得到了满分。然而，他在介绍职位时未能充分利用机会强调职位的吸引点，可能影响候选人的兴趣。'
                },
                {
                  label: '收集信息（现状$&$期望）',
                  score: '90',
                  content: '张伟在收集候选人的现状和期望方面做得相对完善，能够获得关于候选人当前工作和技术栈的重要信息。但对于候选人的项目经验和薪资结构的探讨不够深入，这可能会影响到后续的职位匹配和期望管理。'
                },
                {
                  label: '挖掘需求',
                  score: '70',
                  content: '张伟在挖掘候选人需求方面还有提升空间。虽然基本了解了候选人的职业期望，但在探索候选人的非薪酬动机和深层次需求方面表现不够充分，这是建立有效推荐和深度关系的关键。'
                },
                {
                  label: '有效推荐',
                  score: '73',
                  content: '在有效推荐职位方面，张伟需要加强与候选人需求的匹配度和说服力。虽然提到了职位的技术优势，但未根据候选人的具体技术背景进行个性化强调，可能减少候选人的兴趣。'
                },
                {
                  label: '建立信任关系',
                  score: '84',
                  content: '张伟能够通过有效的沟通建立信任关系，使用开放性问题和积极肯定候选人的表现。然而，需要提高在换位思考和理解候选人深层需求方面的能力，确保信任关系的深度和真实性。'
                }
              ]
            }}
          />
        </ReportView>
        <ReportView title="评分细节">
          <ReportView.Table
            report={{
              columns: [
                {
                  title: '评估维度',
                  name: 'group',
                  isSubTitle: true
                },
                {
                  title: '评分项',
                  name: 'item',
                  span: 10
                },
                {
                  title: '得分',
                  name: 'score',
                  span: 4,
                  valueOf: value => <div className="score">{value}</div>
                },
                {
                  title: '描述',
                  name: 'description',
                  span: 10
                }
              ],
              group: [
                {
                  name: 'group1',
                  label: '沟通程序指引及话术'
                },
                {
                  name: 'group2',
                  label: '收集信息（现状&期望）'
                },
                {
                  name: 'group3',
                  label: '挖掘需求'
                },
                {
                  name: 'group4',
                  label: '有效推荐'
                },
                {
                  name: 'group5',
                  label: '建立信任关系'
                }
              ],
              list: [
                {
                  group: 'group1',
                  item: '专业开场',
                  score: '90',
                  description: '开场专业，语气友好，略显急促。'
                },
                {
                  group: 'group1',
                  item: '询问是否方便通话',
                  score: '100',
                  description: '表现出极好的礼貌和考虑。'
                },
                {
                  group: 'group1',
                  item: '先了解候选人整体情况',
                  score: '80',
                  description: '详细询问了技术和动机，未深入个人发展。'
                },
                {
                  group: 'group1',
                  item: '后介绍推荐OD职位',
                  score: '70',
                  description: '介绍清晰，未充分突出职位吸引力。'
                },
                {
                  group: 'group1',
                  item: '介绍整体面试流程',
                  score: '90',
                  description: '详尽介绍流程，缺少机考准备细节说明。'
                },
                {
                  group: 'group1',
                  item: '交换联系方式',
                  score: '100',
                  description: '有效且自然，确保双方畅通无阻。'
                },
                {
                  group: 'group2',
                  item: '了解候选人目前就业状态',
                  score: '100',
                  description: '详尽了解候选人的当前就业状况。'
                },
                {
                  group: 'group2',
                  item: '了解候选人技术栈及项目经验',
                  score: '80',
                  description: '详细询问技术栈，对项目经验探讨不足。'
                },
                {
                  group: 'group2',
                  item: '了解候选人薪资情况与结构',
                  score: '90',
                  description: '了解薪资期望清晰，未详细探讨薪资构成。'
                },
                {
                  group: 'group3',
                  item: '了解候选人对下一份工作的期望',
                  score: '70',
                  description: '探讨了职业规划，但未深挖发展意愿。'
                },
                {
                  group: 'group3',
                  item: '探索非薪资求职动机',
                  score: '60',
                  description: '基本了解求职动机，缺乏深度和细节。'
                },
                {
                  group: 'group3',
                  item: '识别并处理顾虑',
                  score: '80',
                  description: '识别了顾虑，回应稍显模糊。'
                },
                {
                  group: 'group4',
                  item: '链接职位优势与求职动机',
                  score: '70',
                  description: '提及职位相关性，缺乏说服力。'
                },
                {
                  group: 'group4',
                  item: '强化项目技术吸引点',
                  score: '70',
                  description: '提及技术优势，未针对候选人背景定制。'
                },
                {
                  group: 'group4',
                  item: '关注并处理候选人顾虑',
                  score: '80',
                  description: '正面回应顾虑，但解决方案不具体。'
                },
                {
                  group: 'group5',
                  item: '应用开放性提问',
                  score: '90',
                  description: '使用开放性问题促进了对话深入。'
                },
                {
                  group: 'group5',
                  item: '换位思考与表达同理心',
                  score: '80',
                  description: '表达了同理心，但部分回答未完全站在候选人角度。'
                },
                {
                  group: 'group5',
                  item: '表达肯定和欣赏',
                  score: '100',
                  description: '非常好地肯定了候选人的能力和经验。'
                },
                {
                  group: 'group5',
                  item: '清晰表达观点',
                  score: '80',
                  description: '观点主要清晰，偶有不够准确的情况。'
                },
                {
                  group: 'group5',
                  item: '有效倾听与理解',
                  score: '70',
                  description: '倾听良好，但有时未能完全抓住候选人的意图。'
                }
              ]
            }}
          />
        </ReportView>
        <ReportView title="结论与建议">
          <ReportView.Part
            report={{
              list: [
                {
                  label: '结论',
                  hasBgColor: true,
                  content:
                    '在此次AI情景模拟测评中，李四表现出了较强的沟通能力和专业性，尤其是在程序指引及话术方面。他成功地收集了候选人的基本信息并建立了初步的信任关系。然而，他在深入挖掘候选人需求和个性化推荐职位方面的表现还有待提高。总体而言，李四的表现良好，显示出了他作为招聘顾问的潜力。'
                },
                {
                  label: '建议',
                  style: { '--marker-color': '#027A48', '--label-bg-color': '#027A481a' },
                  content: (
                    <ol>
                      <li>增强职位介绍的吸引力，特别是将职位优势与候选人的需求直接关联，突出表现职位的独特之处。</li>
                      <li>对候选人的项目经验进行更详细的询问，尤其是关于如何在项目中解决问题和技术应用的具体情况。</li>
                      <li>在讨论薪资时，应详细了解候选人的薪资构成和期望，确保提供的职位与候选人的薪资期望相匹配。</li>
                      <li>在交流中穿插探讨候选人的个人兴趣和长期职业目标，以便更好地理解其动机。</li>
                      <li>根据候选人的技术能力和职业兴趣定制职位推荐，突出职位的技术挑战和成长机会。</li>
                      <li>加强同理心的表达，尤其在讨论候选人关切的问题时，从其角度出发提供解决方案。</li>
                    </ol>
                  )
                }
              ]
            }}
          />
        </ReportView>
        <ReportView title="结论与建议">自定义 area</ReportView>
      </Space>
    </div>
  );
};

render(<BaseExample />);
